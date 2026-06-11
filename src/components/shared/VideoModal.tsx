import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

export function VideoModal({
  src,
  open,
  onClose,
  title,
}: {
  src: string;
  open: boolean;
  onClose: () => void;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (open) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[90] grid place-items-center bg-black/80 backdrop-blur-md p-4 md:p-8"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} demo video`}
        >
          <motion.div
            initial={{ y: 20, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/70">
                {title} — demo
              </span>
              <button
                type="button"
                onClick={onClose}
                data-cursor="hover"
                aria-label="Close video"
                className="h-9 w-9 rounded-full grid place-items-center border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/15 bg-black shadow-[0_30px_80px_-20px_rgba(194,65,12,0.4)]">
              <video
                ref={videoRef}
                src={src}
                controls
                playsInline
                preload="metadata"
                className="w-full h-auto block max-h-[80vh]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
