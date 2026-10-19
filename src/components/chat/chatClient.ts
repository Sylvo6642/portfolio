import { Chat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { browserId } from './quota';

// Mirrors api/_chat/agent.js: what each tool returns, for typed tool parts
export type ChatProject = {
  name: string;
  category: string;
  status: 'live' | 'wip' | 'private';
  summary: string;
  tech: string[];
  repo: string | null;
  liveUrl: string | null;
};
export type ChatExperience = { role: string; company: string; start: string; end: string | null; location: string; bullets: string[] };
export type ChatContact = { email: string; linkedin: string; github: string; website: string; resume: string };
export type ChatAvailability = { openToWork: boolean; roles: string[]; locations: string };

type ChatTools = {
  showProjects: { input: { names: string[] }; output: { projects: ChatProject[] } };
  showExperience: { input: Record<string, never>; output: { experience: ChatExperience[] } };
  showSkills: { input: Record<string, never>; output: { skills: { title: string; items: string[] }[] } };
  showContact: { input: Record<string, never>; output: { contact: ChatContact; availability: ChatAvailability } };
  showResume: { input: Record<string, never>; output: { url: string; name: string } };
};

/** Sent with each finished answer: usage for the "behind the scenes" view, plus the quota */
export type ChatMetadata = {
  model: string;
  tools: string[];
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number | null;
  remaining: number;
  limit: number;
  resetAt: string | null;
};

export type ChatMessage = UIMessage<ChatMetadata, never, ChatTools>;

export { fetchQuota, type Quota } from './quota';

// One conversation per page load, kept alive while the panel is closed
export const chat = new Chat<ChatMessage>({
  transport: new DefaultChatTransport({
    api: '/api/chat',
    headers: () => ({ 'X-Browser-Id': browserId() }),
    // The server only keeps the last few text turns anyway
    prepareSendMessagesRequest: ({ messages }) => ({ body: { messages: messages.slice(-6) } }),
  }),
});

/** Turns a failed request into something to show the visitor */
export function describeError(error: Error | undefined): { kind: 'limit' | 'error'; message: string; resetAt?: string | null } | null {
  if (!error) return null;
  let body: { error?: string; message?: string; resetAt?: string | null } = {};
  try {
    body = JSON.parse((error as Error & { responseBody?: string }).responseBody ?? error.message);
  } catch {}
  if (body.error === 'limit') return { kind: 'limit', message: '', resetAt: body.resetAt };
  return { kind: 'error', message: body.message ?? 'Something went wrong. Please try again.' };
}
