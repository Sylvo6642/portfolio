import { AnimatePresence, motion, useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useIsCoarsePointer } from '../../hooks/useMousePosition';
import { VideoModal } from '../shared/VideoModal';
import { PERSONAL_PROJECTS, PROFESSIONAL_CARDS, type PersonalProject, type ProjectStatus } from '../../data/projects';

const EASE = [0.76, 0, 0.24, 1] as const;
const PROJECTS = PERSONAL_PROJECTS.filter((p) => !p.hidden);
const STATUS_LABEL: Record<ProjectStatus, string> = { live: 'Live', wip: 'In development', private: 'Private build' };

/* CommitGrid has no screenshot — draw a small contributions heatmap instead */
function CommitGridArt() {
  const cells = useMemo(() => {
    // Deterministic pseudo-random levels so the art is stable between renders
    let seed = 7;
    return Array.from({ length: 7 * 22 }, () => {
      seed = (seed * 9301 + 49297) % 233280;
      const r = seed / 233280;
      return r < 0.32 ? 0 : r < 0.58 ? 1 : r < 0.78 ? 2 : r < 0.92 ? 3 : 4;
    });
  }, []);
  const shades = ['#161B22', '#0E4429', '#006D32', '#26A641', '#39D353'];
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-[3px] p-4 rounded-md bg-[#0D1117] shadow-[0_20px_50px_rgb(0_0_0/0.45)]">
      {cells.map((level, i) => (
        <span key={i} className="h-[9px] w-[9px] rounded-[2px]" style={{ background: shades[level] }} />
      ))}
    </div>
  );
}

function PreviewArt({ p }: { p: PersonalProject }) {
  if (p.preview) {
    return <img src={p.preview} alt="" className="w-[82%] h-auto rounded-[3px] shadow-[0_20px_50px_rgb(0_0_0/0.3)]" loading="lazy" decoding="async" />;
  }
  return <CommitGridArt />;
}

/* Floating preview that trails the cursor over the work list (fine pointers only) */
function HoverPreview({ active, index, label, x, y }: {
  active: boolean;
  index: number;
  label: string;
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const modalX = useSpring(x, { stiffness: 150, damping: 20, mass: 0.5 });
  const modalY = useSpring(y, { stiffness: 150, damping: 20, mass: 0.5 });
  const cursorX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.4 });
  const cursorY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.4 });
  const scale = { scale: active ? 1 : 0 };
  const transition = { duration: 0.4, ease: EASE };

  return createPortal(
    <>
      <motion.div className="fixed left-0 top-0 z-[45] pointer-events-none" style={{ x: modalX, y: modalY }} aria-hidden>
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 h-[300px] w-[360px] lg:h-[340px] lg:w-[400px] overflow-hidden"
          initial={false}
          animate={scale}
          transition={transition}
        >
          <div className="h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" style={{ transform: `translateY(${-index * 100}%)` }}>
            {PROJECTS.map((p) => (
              <div key={p.name} className="h-full w-full flex items-center justify-center" style={{ background: p.previewBg }}>
                <PreviewArt p={p} />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
      <motion.div className="fixed left-0 top-0 z-[46] pointer-events-none" style={{ x: cursorX, y: cursorY }} aria-hidden>
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 grid h-20 w-20 place-items-center rounded-full bg-accent text-[14px] text-on-accent"
          initial={false}
          animate={scale}
          transition={transition}
        >
          {label}
        </motion.div>
      </motion.div>
    </>,
    document.body,
  );
}

function ProjectDetails({ p, onVideoOpen }: { p: PersonalProject; onVideoOpen: (p: PersonalProject) => void }) {
  const pill = 'inline-flex items-center gap-2 rounded-full border border-fg/20 px-5 py-2.5 text-sm transition-colors hover:bg-fg hover:text-bg hover:border-fg';
  return (
    <motion.div
      key="details"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-8 md:gap-14 px-1 sm:px-4 md:px-[6%] pb-12 md:pb-16">
        <div className="flex aspect-[16/11] items-center justify-center overflow-hidden" style={{ background: p.previewBg }}>
          <PreviewArt p={p} />
        </div>
        <div className="flex flex-col">
          <p className="eyebrow">{STATUS_LABEL[p.status]}</p>
          <p className="mt-4 text-[17px] md:text-lg leading-[1.55] tracking-[-0.01em]">{p.summary}</p>
          <ul className="mt-5 space-y-2.5">
            {p.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-[15px] leading-[1.6] text-fg/75">
                <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                {h}
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tech stack">
            {p.tech.map((t) => (
              <li key={t} className="rounded-full bg-accent-soft text-accent-soft-text px-3 py-1 text-[13px] text-fg/80">{t}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            {p.video && (
              <button type="button" onClick={() => onVideoOpen(p)} className={pill} data-cursor="hover">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                Watch demo
              </button>
            )}
            {p.liveUrl && (
              <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={pill} data-cursor="hover">
                View project
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M7 17L17 7M7 7h10v10" /></svg>
              </a>
            )}
            {p.link ? (
              <a href={p.link} target="_blank" rel="noopener noreferrer" className={pill} data-cursor="hover">{p.linkLabel}</a>
            ) : (
              <span className="inline-flex items-center rounded-full border border-fg/10 px-5 py-2.5 text-sm text-fg/45">{p.linkLabel}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Projects() {
  const coarse = useIsCoarsePointer();
  const [video, setVideo] = useState<PersonalProject | null>(null);
  const [openName, setOpenName] = useState<string | null>(null);
  const [hover, setHover] = useState<{ active: boolean; index: number }>({ active: false, index: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const listRef = useRef<HTMLUListElement>(null);

  const onMove = (event: MouseEvent) => {
    mouseX.set(event.clientX);
    mouseY.set(event.clientY);
  };

  // Scrolling (wheel, keyboard, anchor jumps) can carry the list out from under a
  // still cursor without firing mouseleave — hide the preview when that happens
  useEffect(() => {
    if (!hover.active) return;
    const onScroll = () => {
      const under = document.elementFromPoint(mouseX.get(), mouseY.get());
      if (!under || !listRef.current?.contains(under)) setHover((h) => ({ ...h, active: false }));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hover.active, mouseX, mouseY]);

  const hovered = PROJECTS[hover.index];

  return (
    <section id="projects" className="relative bg-bg pt-20 pb-28 md:pt-28 md:pb-40">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-10">
        <p className="eyebrow mb-8 md:mb-12 md:px-[6%]">(01) — Recent work</p>

        <ul ref={listRef} className="border-b border-edge" onMouseMove={onMove} onMouseLeave={() => setHover((h) => ({ ...h, active: false }))}>
          {PROJECTS.map((p, i) => {
            const open = openName === p.name;
            return (
              <motion.li
                key={p.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 * i }}
                className="border-t border-edge"
              >
                <button
                  type="button"
                  onClick={() => setOpenName(open ? null : p.name)}
                  onMouseEnter={() => setHover({ active: true, index: i })}
                  onMouseLeave={() => setHover((h) => ({ ...h, active: false }))}
                  aria-expanded={open}
                  className="group/row w-full flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6 px-1 sm:px-4 md:px-[6%] py-8 sm:py-10 md:py-14 text-left"
                  data-cursor="hover"
                >
                  <span className="display-type text-[clamp(2.4rem,7vw,5.75rem)] tracking-[-0.04em] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:group-hover/row:-translate-x-3 md:group-hover/row:opacity-40">
                    {p.name}
                  </span>
                  <span className="flex items-center gap-4 text-[14px] sm:text-[15px] text-fg/80 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:group-hover/row:translate-x-3 md:group-hover/row:opacity-40">
                    {p.category}
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden
                      className={`shrink-0 transition-transform duration-500 ${open ? 'rotate-45' : ''}`}
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && <ProjectDetails p={p} onVideoOpen={setVideo} />}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>

        {/* Day-job work */}
        <div className="mt-24 md:mt-36">
          <p className="eyebrow mb-8 md:mb-12 md:px-[6%]">What I build at work</p>
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-edge md:mx-[6%]">
            {PROFESSIONAL_CARDS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.06 * (i % 2) }}
                className={`border-b border-edge py-8 md:py-10 ${i % 2 === 0 ? 'md:pr-10 md:border-r' : 'md:pl-10'}`}
              >
                <h3 className="text-[clamp(1.35rem,2vw,1.75rem)] tracking-[-0.02em] leading-tight">{c.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-fg/70">{c.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {!coarse && (
        <HoverPreview
          active={hover.active}
          index={hover.index}
          label={openName === hovered?.name ? 'Close' : 'Open'}
          x={mouseX}
          y={mouseY}
        />
      )}

      <VideoModal src={video?.video ?? ''} open={!!video} onClose={() => setVideo(null)} title={video?.name ?? ''} />
    </section>
  );
}
