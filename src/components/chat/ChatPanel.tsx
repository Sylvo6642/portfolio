import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ToolCard } from './ChatCards';
import { chat, describeError, fetchQuota, type ChatMessage, type ChatMetadata, type Quota } from './chatClient';

const MAX_CHARS = 300;
const EMAIL = 'robinkevin648@gmail.com';
const INTERNALS_KEY = 'kr-chat-internals';

const SUGGESTIONS = [
  'What are you working on right now?',
  'Show me your projects',
  'Are you open to new roles?',
  'How can I contact you?',
];

// Linkify emails and URLs in plain-text answers
const LINK = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(LINK).map((chunk, i) => {
        if (i % 2 === 0) return chunk;
        const href = chunk.includes('@') && !chunk.startsWith('http') ? `mailto:${chunk}` : chunk;
        return (
          <a key={i} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="underline decoration-accent/60 underline-offset-2 hover:decoration-accent break-words">
            {chunk}
          </a>
        );
      })}
    </>
  );
}

function Internals({ meta }: { meta: ChatMetadata }) {
  const items = [
    ...meta.tools.map((t) => `⚙ ${t}`),
    `${meta.inputTokens.toLocaleString()} → ${meta.outputTokens.toLocaleString()} tokens`,
    `${(meta.latencyMs / 1000).toFixed(1)} s`,
    meta.costUsd != null ? `$${meta.costUsd.toFixed(5)}` : null,
    meta.model,
  ].filter(Boolean);
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {items.map((item) => (
        <span key={item} className="rounded-md bg-fg/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-muted">{item}</span>
      ))}
    </div>
  );
}

function Message({ message, showInternals }: { message: ChatMessage; showInternals: boolean }) {
  if (message.role === 'user') {
    const text = message.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-[14px] leading-relaxed text-on-accent">{text}</p>
      </div>
    );
  }
  return (
    <div className="flex max-w-[92%] flex-col gap-2">
      {message.parts.map((part, i) => {
        if (part.type === 'text') {
          return part.text ? (
            <p key={i} className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-fg/90"><RichText text={part.text} /></p>
          ) : null;
        }
        if (part.type.startsWith('tool-')) {
          return <ToolCard key={i} part={part as Parameters<typeof ToolCard>[0]['part']} showInternals={showInternals} />;
        }
        return null;
      })}
      {showInternals && message.metadata && <Internals meta={message.metadata} />}
    </div>
  );
}

function formatReset(iso: string | null | undefined) {
  if (!iso) return 'tomorrow';
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function LimitNotice({ resetAt }: { resetAt: string | null | undefined }) {
  return (
    <div className="rounded-2xl hairline bg-surface p-4 text-[14px] leading-relaxed">
      That's all the questions I can answer today. Email me at{' '}
      <a href={`mailto:${EMAIL}`} className="underline decoration-accent underline-offset-2">{EMAIL}</a>{' '}
      and I'll reply personally. The chat opens again around {formatReset(resetAt)}.
    </div>
  );
}

function IconButton({ label, onClick, children, active }: { label: string; onClick: () => void; children: ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${active ? 'bg-accent text-on-accent' : 'text-fg/70 hover:bg-fg/10 hover:text-fg'}`}
    >
      {children}
    </button>
  );
}

type Props = {
  onClose: () => void;
  /** 'panel' is the floating chat; 'page' fills the screen as the chat home */
  variant?: 'panel' | 'page';
  /** Asked as soon as the panel opens (from the chat home's input) */
  initialQuestion?: string;
};

export default function ChatPanel({ onClose, variant = 'panel', initialQuestion }: Props) {
  const { messages, sendMessage, status, error, clearError } = useChat<ChatMessage>({ chat });
  const [input, setInput] = useState('');
  const [quota, setQuota] = useState<Quota | null>(null);
  const [showInternals, setShowInternals] = useState(() => {
    try { return localStorage.getItem(INTERNALS_KEY) === '1'; } catch { return false; }
  });
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const asked = useRef(false);
  const page = variant === 'page';
  // Centres the conversation in a readable column on the full-screen page
  const column = page ? 'mx-auto w-full max-w-2xl' : '';

  useEffect(() => { fetchQuota().then((q) => q && setQuota(q)); }, []);
  useEffect(() => {
    // Arriving with a question on a phone: let the answer show instead of the keyboard
    if (initialQuestion && window.matchMedia('(pointer: coarse)').matches) return;
    inputRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The latest answer carries the up-to-date quota
  const lastMeta = [...messages].reverse().find((m) => m.metadata)?.metadata;
  useEffect(() => {
    if (lastMeta) setQuota({ remaining: lastMeta.remaining, limit: lastMeta.limit, resetAt: lastMeta.resetAt });
  }, [lastMeta]);

  // Pin the newest question to the top so a tall card streams in below it
  const lastQuestionId = [...messages].reverse().find((m) => m.role === 'user')?.id;
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-message="${lastQuestionId}"]`);
    if (list && el) list.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
  }, [lastQuestionId]);

  const problem = describeError(error);
  const limited = problem?.kind === 'limit' || quota?.remaining === 0;
  const busy = status === 'submitted' || status === 'streaming';

  const ask = (text: string) => {
    const q = text.trim().slice(0, MAX_CHARS);
    if (!q || busy || limited) return;
    if (error) clearError();
    sendMessage({ text: q });
    setInput('');
  };

  useEffect(() => {
    if (!initialQuestion || asked.current) return;
    asked.current = true;
    ask(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const toggleInternals = () => {
    setShowInternals((v) => {
      try { localStorage.setItem(INTERNALS_KEY, v ? '0' : '1'); } catch {}
      return !v;
    });
  };

  return (
    <div className={page ? 'flex h-full flex-col overflow-hidden bg-bg text-fg' : 'on-ink flex h-full flex-col overflow-hidden md:rounded-3xl md:shadow-[0_24px_80px_rgb(0_0_0/0.35)] md:ring-1 md:ring-white/10'}>
      <header className={`flex items-center gap-3 border-b border-edge px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:pt-3 ${page ? 'md:px-8' : ''}`}>
        <img src="/kevin.jpg" alt="" className="h-9 w-9 rounded-full object-cover object-[50%_30%]" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium leading-tight">Ask AI Kevin</p>
          <p className="truncate text-[11px] text-muted">An AI version of me, answering from my portfolio</p>
        </div>
        <IconButton label={showInternals ? 'Hide behind the scenes' : 'Show behind the scenes'} onClick={toggleInternals} active={showInternals}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M8 6l-6 6 6 6M16 6l6 6-6 6" /></svg>
        </IconButton>
        {page ? (
          <button type="button" onClick={onClose} className="ml-1 shrink-0 rounded-full hairline px-3.5 py-2 text-[13px] text-fg/85 transition-colors hover:border-accent hover:text-fg">
            View portfolio <span aria-hidden>↓</span>
          </button>
        ) : (
          <IconButton label="Close chat" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
          </IconButton>
        )}
      </header>

      <div ref={listRef} className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-4" data-lenis-prevent aria-live="polite">
        <div className={`flex flex-col gap-4 ${column}`}>
          <div className="flex max-w-[92%] flex-col gap-3">
            <p className="text-[14px] leading-relaxed text-fg/90">
              Hey, I'm an AI version of Kevin. Ask me about my projects, experience, stack, or whether I'm open to new roles.
            </p>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)} disabled={limited} className="rounded-full hairline px-3 py-1.5 text-left text-[13px] text-fg/85 transition-colors hover:border-accent hover:text-fg disabled:opacity-40">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {messages.map((m) => (
            <div key={m.id} data-message={m.id}>
              <Message message={m} showInternals={showInternals} />
            </div>
          ))}

          {status === 'submitted' && (
            <div className="flex gap-1 py-2" aria-label="Thinking">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </div>
          )}

          {problem?.kind === 'error' && <p className="text-[13px] text-[#E39A9A]">{problem.message}</p>}
          {limited && <LimitNotice resetAt={problem?.resetAt ?? quota?.resetAt} />}
        </div>
      </div>

      <form onSubmit={onSubmit} className="border-t border-edge px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className={column}>
          <div className="flex items-end gap-2 rounded-2xl bg-surface px-3 py-2 ring-1 ring-edge focus-within:ring-accent">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); }
              }}
              rows={1}
              maxLength={MAX_CHARS}
              disabled={limited}
              placeholder={limited ? 'Out of questions for today' : 'Ask me anything…'}
              aria-label="Your question"
              // 16px keeps iOS Safari from zooming in on focus
              className="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-[16px] leading-6 text-fg placeholder:text-muted focus:outline-none disabled:opacity-50 md:text-[14px]"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy || limited}
              aria-label="Send"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-opacity disabled:opacity-30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 px-1 font-mono text-[10px] text-muted">
            <span>
              {quota ? `${quota.remaining} of ${quota.limit} questions left today` : '10 questions a day'}
            </span>
            <span>{input.length > MAX_CHARS - 60 ? `${input.length}/${MAX_CHARS}` : 'AI can make mistakes'}</span>
          </div>
        </div>
      </form>
    </div>
  );
}
