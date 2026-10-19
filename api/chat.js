import { convertToModelMessages, pipeUIMessageStreamToResponse, streamText, toUIMessageStream } from 'ai';
import { agentOptions, costUsd, MODEL_ID } from './_chat/agent.js';
import { browserKey, clientIp, complete, getQuota, hashIp, reserve } from './_chat/limits.js';

const MAX_QUESTION_CHARS = 300;
const MAX_HISTORY_CHARS = 1200;
const HISTORY_MESSAGES = 6;

/**
 * Rebuilds the history from text only. The client can't be trusted with tool calls or
 * outputs (a forged tool result is a prompt injection), so those are dropped here and
 * the model re-calls tools when it needs data.
 */
function sanitize(messages) {
  if (!Array.isArray(messages)) return null;
  const clean = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && Array.isArray(m.parts))
    .map((m, i) => ({
      id: typeof m.id === 'string' ? m.id.slice(0, 64) : String(i),
      role: m.role,
      parts: [{
        type: 'text',
        text: m.parts
          .filter((p) => p?.type === 'text' && typeof p.text === 'string')
          .map((p) => p.text)
          .join('\n')
          .slice(0, MAX_HISTORY_CHARS),
      }],
    }))
    .filter((m) => m.parts[0].text.trim())
    .slice(-HISTORY_MESSAGES);
  return clean.length && clean[clean.length - 1].role === 'user' ? clean : null;
}

export default async function handler(req, res) {
  const ipHash = hashIp(clientIp(req));
  const browserId = browserKey(req, ipHash);

  if (req.method === 'GET') {
    try {
      // `available` lets the page skip the chat home when the server has no key
      return res.status(200).json({ ...(await getQuota(browserId, ipHash)), available: Boolean(process.env.OPENAI_API_KEY), model: MODEL_ID });
    } catch (err) {
      console.error('chat quota failed:', err.message);
      return res.status(503).json({ error: 'unavailable' });
    }
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'unavailable', message: 'Chat is not configured. Set OPENAI_API_KEY on the server.' });
  }

  const messages = sanitize(req.body?.messages);
  if (!messages) return res.status(400).json({ error: 'bad_request' });
  // The user's message itself is checked against the raw input, not the truncated copy
  const rawLast = req.body.messages[req.body.messages.length - 1];
  const question = rawLast.parts.filter((p) => p?.type === 'text').map((p) => p.text).join('\n').trim();
  if (question.length > MAX_QUESTION_CHARS) {
    return res.status(400).json({ error: 'too_long', message: `Keep questions under ${MAX_QUESTION_CHARS} characters.` });
  }

  let slot;
  try {
    slot = await reserve(browserId, ipHash, question);
  } catch (err) {
    console.error('chat reserve failed:', err.message);
    return res.status(503).json({ error: 'unavailable' });
  }
  if (!slot.ok) {
    return res.status(429).json({ error: 'limit', reason: slot.reason, remaining: 0, limit: slot.limit, resetAt: slot.resetAt });
  }

  const started = Date.now();
  const toolsUsed = new Set();
  const abort = new AbortController();
  res.on('close', () => { if (!res.writableEnded) abort.abort(); });

  const result = streamText({
    ...agentOptions(await convertToModelMessages(messages)),
    abortSignal: abort.signal,
    onToolExecutionStart: ({ toolCall }) => { toolsUsed.add(toolCall.toolName); },
    onEnd: ({ text, usage }) => complete(slot.id, {
      status: 'ok',
      answer: text,
      tools: [...toolsUsed],
      model: MODEL_ID,
      input_tokens: usage.inputTokens ?? null,
      output_tokens: usage.outputTokens ?? null,
      latency_ms: Date.now() - started,
      cost_usd: costUsd(usage),
    }),
    onError: ({ error }) => complete(slot.id, { status: 'error', error: String(error?.message ?? error).slice(0, 500) }),
  });

  pipeUIMessageStreamToResponse({
    response: res,
    stream: toUIMessageStream({
      stream: result.stream,
      // Powers the "behind the scenes" view and the questions-left counter
      messageMetadata: ({ part }) => {
        if (part.type !== 'finish') return undefined;
        return {
          model: MODEL_ID,
          tools: [...toolsUsed],
          inputTokens: part.totalUsage.inputTokens ?? 0,
          outputTokens: part.totalUsage.outputTokens ?? 0,
          latencyMs: Date.now() - started,
          costUsd: costUsd(part.totalUsage),
          remaining: slot.remaining,
          limit: slot.limit,
          resetAt: slot.resetAt,
        };
      },
      onError: () => 'Sorry, something broke on my side. Try again in a moment.',
    }),
  });
}
