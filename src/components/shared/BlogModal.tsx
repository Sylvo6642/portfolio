import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { BlogPost } from '../../data/courses';

export function BlogModal({ post, onClose }: { post: BlogPost | null; onClose: () => void }) {
  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [post, onClose]);

  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={post.title}
        >
          <motion.div
            initial={{ y: 24, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl hairline bg-bg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 hairline-b">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent">{post.tag}</span>
                  {post.date && <span className="font-mono text-[10px] text-muted">{post.date}</span>}
                </div>
                <h2 className="mt-1 text-xl font-semibold leading-snug">{post.title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                data-cursor="hover"
                aria-label="Close"
                className="shrink-0 mt-0.5 h-8 w-8 rounded-full grid place-items-center hairline text-muted hover:text-fg hover:bg-fg/5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm leading-relaxed text-fg/80">
              {post.content?.map((section, i) => {
                const parts = section.body.split(/(```[\s\S]*?```)/g);
                return (
                  <div key={i}>
                    {section.heading && (
                      <h3 className="mb-2 font-semibold text-fg">{section.heading}</h3>
                    )}
                    {parts.map((part, j) => {
                      if (part.startsWith('```')) {
                        const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
                        return (
                          <pre key={j} className="mt-2 mb-2 rounded-lg bg-code-bg p-4 overflow-x-auto font-mono text-xs text-code-text leading-relaxed whitespace-pre">
                            {code}
                          </pre>
                        );
                      }
                      return (
                        <div key={j}>
                          {part.split('\n').map((line, k) =>
                            line.startsWith('- ') ? (
                              <li key={k} className="ml-4 list-disc mb-1">{line.slice(2)}</li>
                            ) : line.trim() === '' ? null : (
                              <p key={k} className="mb-1">{line}</p>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
