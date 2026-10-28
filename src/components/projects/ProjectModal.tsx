import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { setScrollLocked } from '../../lib/scroll';
import type { PersonalProject, ProjectStatus } from '../../data/projects';
import { ProjectCover } from './ProjectCover';

const EASE = [0.22, 1, 0.36, 1] as const;
const STATUS_LABEL: Record<ProjectStatus, string> = { live: 'Live', wip: 'In development', private: 'Private build' };

/** Project details opened from a gallery card: a bottom sheet on phones, a centred panel above */
export function ProjectModal({ project, onClose, onVideoOpen, videoOpen }: {
  project: PersonalProject | null;
  onClose: () => void;
  onVideoOpen: (p: PersonalProject) => void;
  /** The demo video sits on top; Escape and scroll lock belong to it while it's open */
  videoOpen: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;
    setScrollLocked(true);
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      setScrollLocked(false);
      previous?.focus?.({ preventScroll: true });
    };
  }, [project]);

  useEffect(() => {
    if (!project || videoOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, videoOpen, onClose]);

  const pill = 'inline-flex items-center gap-2 rounded-full border border-fg/20 px-5 py-2.5 text-sm transition-colors hover:bg-fg hover:text-bg hover:border-fg';

  // Rendered at the page root: <main> is its own stacking layer, which would keep the menu button above it
  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[85] flex items-end md:items-center justify-center bg-black/55 backdrop-blur-sm md:p-8"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={project.name}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative flex w-full max-w-4xl max-h-[92dvh] md:max-h-[88dvh] flex-col overflow-hidden rounded-t-[22px] md:rounded-[22px] border border-edge bg-bg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              data-cursor="hover"
              aria-label="Close project details"
              className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-bg/85 text-fg backdrop-blur border border-edge transition-colors hover:bg-fg hover:text-bg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            <div className="overflow-y-auto overscroll-contain" data-lenis-prevent>
              <div className="relative aspect-[16/9] max-h-[42dvh] w-full overflow-hidden">
                <ProjectCover project={project} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-8 md:gap-12 px-5 sm:px-8 md:px-10 pt-7 md:pt-9 pb-10">
                <div>
                  <p className="eyebrow">{STATUS_LABEL[project.status]} · {project.category}</p>
                  <h2 className="display-type mt-3 text-[clamp(2.2rem,5vw,3.5rem)]">{project.name}</h2>
                  <p className="mt-5 text-[17px] md:text-lg leading-[1.55] tracking-[-0.01em]">{project.summary}</p>
                  <ul className="mt-5 space-y-2.5">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex gap-3 text-[15px] leading-[1.6] text-fg/75">
                        <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col">
                  <p className="eyebrow">Stack</p>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech stack">
                    {project.tech.map((t) => (
                      <li key={t} className="rounded-full bg-accent-soft text-accent-soft-text px-3 py-1 text-[13px]">{t}</li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {project.video && (
                      <button type="button" onClick={() => onVideoOpen(project)} className={pill} data-cursor="hover">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                        Watch demo
                      </button>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={pill} data-cursor="hover">
                        View project
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M7 17L17 7M7 7h10v10" /></svg>
                      </a>
                    )}
                    {project.link ? (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className={pill} data-cursor="hover">{project.linkLabel}</a>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-fg/10 px-5 py-2.5 text-sm text-fg/45">{project.linkLabel}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
