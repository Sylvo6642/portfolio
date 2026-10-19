import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { setScrollLocked } from '../../lib/scroll';

// The panel (and the AI SDK with it) starts loading while the loader is still on screen
const loadPanel = () => import('./ChatPanel');
const ChatPanel = lazy(loadPanel);

const EASE = [0.76, 0, 0.24, 1] as const;
const RISE = [0.22, 1, 0.36, 1] as const;
const MAX_CHARS = 300;

const QUICK = [
  { label: 'Me', question: 'Who are you and what do you do?' },
  { label: 'Projects', question: 'Show me your projects' },
  { label: 'Experience', question: 'Walk me through your work history' },
  { label: 'Skills', question: "What's your tech stack?" },
  { label: 'Contact', question: 'How can I contact you?' },
];

/**
 * The first screen after the loader: a big "ask me anything" prompt, with the classic
 * portfolio one click away underneath. Asking turns the screen into the full chat.
 */
export function ChatHome({ ready, onExit }: { ready: boolean; onExit: () => void }) {
  const [question, setQuestion] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadPanel(); }, []);

  // The portfolio sits underneath; keep it still until the visitor heads there
  useEffect(() => {
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, []);

  useEffect(() => {
    if (ready && !window.matchMedia('(pointer: coarse)').matches) inputRef.current?.focus({ preventScroll: true });
  }, [ready]);

  const ask = (text: string) => {
    const q = text.trim().slice(0, MAX_CHARS);
    if (q) setQuestion(q);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  // Staggered entrance once the loader has lifted
  const enter = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, ease: RISE, delay: 0.35 + i * 0.08 },
  });

  return (
    <motion.div
      className="fixed inset-0 z-[85] h-[100dvh] bg-bg text-fg"
      exit={{ y: '-100%', transition: { duration: 0.9, ease: EASE } }}
      data-lenis-prevent
    >
      <AnimatePresence mode="wait" initial={false}>
        {question === null ? (
          <motion.section
            key="home"
            aria-label="Ask AI Kevin"
            className="flex h-full flex-col items-center justify-center overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]"
            exit={{ opacity: 0, y: -16, transition: { duration: 0.3, ease: 'easeIn' } }}
          >
            <motion.div {...enter(0)} className="relative">
              <img src="/kevin.jpg" alt="" className="h-20 w-20 rounded-full object-cover object-[50%_30%] md:h-24 md:w-24" />
              <span aria-hidden className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-[#5BB974] ring-[3px] ring-bg" />
            </motion.div>

            <motion.p {...enter(1)} className="mt-6 text-center text-[17px] text-muted md:text-xl">
              Hey, I'm Kevin <span aria-hidden>👋</span> Full-Stack &amp; AI Engineer
            </motion.p>

            <motion.h2 {...enter(2)} className="display-type mt-3 text-center text-[clamp(3rem,11vw,8.5rem)]">
              Ask me <span className="stroke-text">anything</span>
            </motion.h2>

            <motion.form {...enter(3)} onSubmit={onSubmit} className="mt-8 w-full max-w-xl md:mt-12">
              <div className="flex items-center gap-2 rounded-full bg-surface py-2 pl-5 pr-2 ring-1 ring-edge transition-shadow focus-within:ring-accent">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                  maxLength={MAX_CHARS}
                  placeholder="Ask about my work, stack or availability…"
                  aria-label="Your question"
                  enterKeyHint="send"
                  // 16px keeps iOS Safari from zooming in on focus
                  className="min-w-0 flex-1 bg-transparent py-2 text-[16px] text-fg placeholder:text-muted focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-opacity disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                </button>
              </div>
            </motion.form>

            <motion.div {...enter(4)} className="mt-4 flex max-w-xl flex-wrap justify-center gap-2">
              {QUICK.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => ask(q.question)}
                  className="rounded-full hairline px-4 py-2 text-[14px] text-fg/80 transition-colors hover:border-accent hover:text-fg"
                >
                  {q.label}
                </button>
              ))}
            </motion.div>

            <motion.div {...enter(5)} className="mt-12 flex flex-col items-center gap-3 md:mt-16">
              <span className="eyebrow">or</span>
              <button
                type="button"
                onClick={onExit}
                className="group inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-[15px] text-bg transition-opacity hover:opacity-90"
              >
                View portfolio
                <span aria-hidden className="transition-transform group-hover:translate-y-0.5">↓</span>
              </button>
              <p className="mt-1 text-center font-mono text-[10px] text-muted">An AI version of me · answers come from my portfolio</p>
            </motion.div>
          </motion.section>
        ) : (
          <motion.div
            key="chat"
            className="h-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: RISE }}
          >
            <Suspense fallback={<div className="h-full bg-bg" />}>
              <ChatPanel variant="page" initialQuestion={question} onClose={onExit} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
