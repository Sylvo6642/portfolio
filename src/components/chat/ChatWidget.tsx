import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useState } from 'react';
import { setScrollLocked } from '../../lib/scroll';

// The AI SDK and the panel load on first hover or open, not with the page
const loadPanel = () => import('./ChatPanel');
const ChatPanel = lazy(loadPanel);

const EASE = [0.22, 1, 0.36, 1] as const;

export function ChatWidget({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    // Full-screen on phones: keep the page behind from scrolling
    const fullScreen = window.matchMedia('(max-width: 767px)').matches;
    if (fullScreen) setScrollLocked(true);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (fullScreen) setScrollLocked(false);
    };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {ready && !open && (
          <motion.button
            key="launcher"
            type="button"
            onClick={() => setOpen(true)}
            onPointerEnter={loadPanel}
            onFocus={loadPanel}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.4, ease: EASE }}
            aria-label="Ask AI Kevin"
            aria-haspopup="dialog"
            className="group fixed bottom-5 right-5 z-[50] flex h-14 items-center rounded-full bg-ink p-1.5 text-[15px] text-white shadow-[0_8px_30px_rgb(0_0_0/0.25)] ring-1 ring-white/10 transition-colors hover:bg-[#2A2019] md:bottom-8 md:right-8"
          >
            <img src="/ai-kevin.webp" alt="" className="h-11 w-11 shrink-0 rounded-full bg-[#F1E4D6] object-contain p-0.5" />
            {/* Just the avatar until hovered (or focused with the keyboard); touch screens keep the circle */}
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-focus-visible:ml-2.5 group-focus-visible:mr-3.5 group-focus-visible:max-w-[9rem] group-focus-visible:opacity-100 [@media(hover:hover)]:group-hover:ml-2.5 [@media(hover:hover)]:group-hover:mr-3.5 [@media(hover:hover)]:group-hover:max-w-[9rem] [@media(hover:hover)]:group-hover:opacity-100">
              Ask AI Kevin
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Chat with AI Kevin"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 z-[75] h-[100dvh] md:inset-auto md:bottom-8 md:right-8 md:h-[min(680px,calc(100vh-4rem))] md:w-[400px]"
          >
            <Suspense fallback={<div className="on-ink h-full md:rounded-xl" />}>
              <ChatPanel onClose={() => setOpen(false)} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
