import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { setScrollLocked } from '../../lib/scroll';
import { ConnectingDots } from '../layout/ConnectingDots';
import { ThemeToggle } from '../layout/ThemeToggle';
import { MAX_CHARS, PromptBox } from './PromptBox';
import type { Quota } from './quota';

// The panel (and the AI SDK with it) starts loading while the loader is still on screen
const loadPanel = () => import('./ChatPanel');
const ChatPanel = lazy(loadPanel);

const RISE = [0.22, 1, 0.36, 1] as const;

// The portfolio's toggle, with a hover tint that shows on light backgrounds too
const themeToggle = (
  <div className="text-fg [&_.nav-theme-toggle:hover]:bg-fg/10">
    <ThemeToggle />
  </div>
);

const QUICK = [
  { label: 'Me', question: 'Who are you and what do you do?' },
  { label: 'Projects', question: 'Show me your projects' },
  { label: 'Experience', question: 'Walk me through your work history' },
  { label: 'Skills', question: "What's your tech stack?" },
  { label: 'Contact', question: 'How can I contact you?' },
];

const HINTS = [
  'Ask about my work, stack or availability…',
  'What are you building right now?',
  'Which project are you proudest of?',
  'Are you open to AI Engineer roles?',
  "What's your tech stack?",
  'Tell me about Clausify…',
  'What do you do outside of work?',
];

/**
 * The first screen after the loader: a big "ask me anything" prompt, with the classic
 * portfolio one click away underneath. Asking turns the screen into the full chat.
 */
export function ChatHome({ ready, quota, onExit }: { ready: boolean; quota: Quota | null; onExit: () => void }) {
  const [question, setQuestion] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadPanel(); }, []);

  // The portfolio sits underneath; keep it still, and out of reach of the keyboard and
  // screen readers, until the visitor heads there
  useEffect(() => {
    setScrollLocked(true);
    const self = rootRef.current;
    const behind = [...(self?.parentElement?.children ?? [])].filter((el) => el !== self && !el.hasAttribute('inert'));
    behind.forEach((el) => el.setAttribute('inert', ''));
    return () => {
      setScrollLocked(false);
      behind.forEach((el) => el.removeAttribute('inert'));
    };
  }, []);

  useEffect(() => {
    if (ready && !window.matchMedia('(pointer: coarse)').matches) inputRef.current?.focus({ preventScroll: true });
  }, [ready]);

  const ask = (text: string) => {
    const q = text.trim().slice(0, MAX_CHARS);
    if (q) setQuestion(q);
  };

  // Staggered entrance once the loader has lifted
  const enter = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, ease: RISE, delay: 0.35 + i * 0.08 },
  });

  return (
    <motion.div
      ref={rootRef}
      className="fixed inset-0 z-[85] h-[100dvh] bg-bg text-fg"
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
      data-lenis-prevent
    >
      {/* The 404 page's network of dots, linking up around the cursor; only behind the prompt,
          so it stops once the conversation (which has its own background) takes over */}
      <AnimatePresence>
        {question === null && (
          <motion.div
            key="network"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : undefined}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          >
            <ConnectingDots className="opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        {question === null ? (
          <motion.section
            key="home"
            aria-label="Ask AI Kevin"
            className="relative flex h-full flex-col items-center justify-center overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]"
            exit={{ opacity: 0, y: -16, transition: { duration: 0.3, ease: 'easeIn' } }}
          >
            <motion.div {...enter(0)} className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] sm:right-6 md:right-8 md:top-7">
              {themeToggle}
            </motion.div>

            <motion.div {...enter(0)} className="relative">
              <img src="/ai-kevin.webp" alt="" className="h-28 w-28 object-contain md:h-36 md:w-36" />
            </motion.div>

            <motion.p {...enter(1)} className="mt-6 text-center text-[17px] text-muted md:text-xl">
              Hey, I'm Kevin <span aria-hidden>👋</span> Full-Stack &amp; AI Engineer
            </motion.p>

            <motion.h2 {...enter(2)} className="display-type mt-3 text-center text-[clamp(3rem,11vw,8.5rem)]">
              Ask me <span className="stroke-text">anything</span>
            </motion.h2>

            <motion.div {...enter(3)} className="mt-8 w-full max-w-2xl md:mt-12">
              <PromptBox
                ref={inputRef}
                size="lg"
                value={input}
                onChange={setInput}
                onSubmit={ask}
                placeholder={HINTS}
                footer={quota ? `${quota.remaining} of ${quota.limit} questions left` : '10 questions'}
              />
            </motion.div>

            <motion.div {...enter(4)} className="mt-5 flex max-w-xl flex-wrap justify-center gap-2">
              {QUICK.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => ask(q.question)}
                  className="rounded-lg hairline bg-bg px-4 py-2 text-[14px] text-fg/80 transition-colors hover:border-accent hover:text-fg"
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
                className="group inline-flex items-center gap-2 rounded-lg bg-fg px-6 py-3 text-[15px] text-bg transition-opacity hover:opacity-90"
              >
                View portfolio
                <span aria-hidden className="transition-transform group-hover:translate-y-0.5">↓</span>
              </button>
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
              <ChatPanel variant="page" initialQuestion={question} onClose={onExit} headerExtra={themeToggle} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
