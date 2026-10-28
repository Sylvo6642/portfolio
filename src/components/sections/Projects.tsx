import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useCallback, useLayoutEffect, useRef, useState, type FocusEvent } from 'react';
import { createPortal } from 'react-dom';
import { VideoModal } from '../shared/VideoModal';
import { ProjectCover } from '../projects/ProjectCover';
import { ProjectModal } from '../projects/ProjectModal';
import { scrollToY } from '../../lib/scroll';
import { PERSONAL_PROJECTS, PROFESSIONAL_CARDS, type PersonalProject } from '../../data/projects';

const PROJECTS = PERSONAL_PROJECTS.filter((p) => !p.hidden);
const COUNT = PROJECTS.length;
const pad = (n: number) => String(n).padStart(2, '0');

/* Track padding lines the first card up with the 1200px content column, then keeps going to the edge */
const TRACK_PAD = { paddingLeft: 'max(var(--pad), calc((100% - 1200px) / 2 + var(--pad)))', paddingRight: 'max(var(--pad), calc((100% - 1200px) / 2 + var(--pad)))' };

function GalleryHeader({ counter }: { counter?: { active: number; progress: MotionValue<number> } }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 md:px-10 flex items-end justify-between gap-6">
      <div>
        <p className="eyebrow mb-4 md:mb-6">(01) — Recent work</p>
        <h2 className="display-type text-[clamp(2rem,4.6vw,3.75rem)] max-w-[12ch] sm:max-w-none">Things I’ve built.</h2>
      </div>
      {counter && (
        <div className="flex shrink-0 flex-col items-end gap-3 md:gap-4" aria-hidden>
          <div className="flex items-baseline gap-2">
            <span className="relative block overflow-hidden display-type font-light text-[clamp(3rem,7vw,5.5rem)] tracking-[-0.05em] leading-[0.9]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={counter.active}
                  className="block"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '-100%' }}
                  transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                >
                  {pad(counter.active + 1)}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="font-mono text-[12px] text-muted">/ {pad(COUNT)}</span>
          </div>
          <div className="h-[2px] w-24 md:w-[220px] bg-edge overflow-hidden">
            <motion.div className="h-full w-full origin-left bg-fg" style={{ scaleX: counter.progress }} />
          </div>
        </div>
      )}
    </div>
  );
}

function CardBody({ project, active, onOpen }: { project: PersonalProject; active: boolean; onOpen: (p: PersonalProject) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      className="group/card block w-full text-left"
      data-cursor="hover"
      aria-label={`${project.name}: ${project.category}. Open details`}
    >
      <div className="work-cover relative w-full overflow-hidden rounded-[14px] md:rounded-2xl border border-edge">
        <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/card:scale-[1.035]">
          <ProjectCover project={project} playing={active} />
        </div>
        <span className="absolute bottom-4 right-4 grid h-12 w-12 md:h-16 md:w-16 place-items-center rounded-full bg-accent text-[12px] md:text-[13px] text-on-accent transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:scale-0 md:group-hover/card:scale-100 md:group-focus-visible/card:scale-100">
          Open
        </span>
      </div>
      <div className="mt-4 md:mt-5 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6 px-1">
        <span className="text-[clamp(1.35rem,2.2vw,1.75rem)] tracking-[-0.02em] leading-tight">{project.name}</span>
        <span className="text-[14px] md:text-[15px] text-muted">{project.category}</span>
      </div>
    </button>
  );
}

function PinnedCard({ project, index, progress, active, onOpen, onFocus }: {
  project: PersonalProject;
  index: number;
  progress: MotionValue<number>;
  active: boolean;
  onOpen: (p: PersonalProject) => void;
  onFocus: (index: number, e: FocusEvent<HTMLDivElement>) => void;
}) {
  // Distance from the card in focus: 0 for it, 1 for its neighbours and beyond
  const distance = useTransform(progress, (v) => Math.min(1, Math.abs(v * (COUNT - 1) - index)));
  const scale = useTransform(distance, [0, 1], [1, 0.92]);
  const opacity = useTransform(distance, [0, 1], [1, 0.6]);
  return (
    <motion.div className="work-card shrink-0" style={{ scale, opacity }} onFocus={(e) => onFocus(index, e)}>
      <CardBody project={project} active={active} onOpen={onOpen} />
    </motion.div>
  );
}

/**
 * The section holds on screen while vertical scroll slides the cards sideways. The scroll it
 * holds for equals how far the track overflows the screen, so the last card lands as it lets go.
 */
function PinnedGallery({ onOpen }: { onOpen: (p: PersonalProject) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const travelValue = useMotionValue(0);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;
    const measure = () => {
      const t = Math.max(0, track.scrollWidth - stage.clientWidth);
      setTravel(t);
      travelValue.set(t);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(track);
    return () => observer.disconnect();
  }, [travelValue]);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const x = useTransform([scrollYProgress, travelValue], ([p, t]: number[]) => -p * t);
  const hint = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.round(v * (COUNT - 1));
    setActive((prev) => (prev === i ? prev : i));
  });

  // Tabbing to a card off to the side scrolls the page until that card is the one in focus
  const onCardFocus = (index: number, e: FocusEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !(e.target as HTMLElement).matches(':focus-visible')) return;
    const top = container.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (index / Math.max(1, COUNT - 1)) * travel);
  };

  return (
    <div ref={containerRef} className="relative" style={{ height: `calc(100dvh + ${travel}px)` }}>
      <div ref={stageRef} className="sticky top-0 flex h-[100dvh] flex-col overflow-hidden pt-24 md:pt-28 pb-10">
        <GalleryHeader counter={{ active, progress: scrollYProgress }} />
        <div className="flex flex-1 items-center min-h-0">
          <motion.div
            ref={trackRef}
            className="flex w-max gap-4 sm:gap-6 md:gap-10 [--pad:20px] sm:[--pad:32px] md:[--pad:40px] will-change-transform"
            style={{ x, ...TRACK_PAD }}
          >
            {PROJECTS.map((p, i) => (
              <PinnedCard key={p.name} project={p} index={i} progress={scrollYProgress} active={active === i} onOpen={onOpen} onFocus={onCardFocus} />
            ))}
          </motion.div>
        </div>
        <motion.div className="pointer-events-none flex items-center justify-center gap-2.5 eyebrow" style={{ opacity: hint }} aria-hidden>
          <svg width="14" height="20" viewBox="0 0 16 22" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="14" height="20" rx="7" />
            <path d="M8 5v4" strokeLinecap="round" />
          </svg>
          Scroll to explore
        </motion.div>
      </div>
    </div>
  );
}

/* Reduce Motion: no pinning, just a row of cards that scrolls sideways on its own */
function StaticRail({ onOpen }: { onOpen: (p: PersonalProject) => void }) {
  return (
    <div className="pt-20 md:pt-28">
      <GalleryHeader />
      <div
        className="mt-10 md:mt-14 flex gap-4 sm:gap-6 md:gap-10 overflow-x-auto snap-x snap-mandatory pb-4 [--pad:20px] sm:[--pad:32px] md:[--pad:40px]"
        style={{ ...TRACK_PAD, scrollPaddingLeft: TRACK_PAD.paddingLeft }}
      >
        {PROJECTS.map((p) => (
          <div key={p.name} className="work-card shrink-0 snap-start">
            <CardBody project={p} active={false} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Projects() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<PersonalProject | null>(null);
  const [video, setVideo] = useState<PersonalProject | null>(null);
  const closeDetails = useCallback(() => setOpen(null), []);
  const closeVideo = useCallback(() => setVideo(null), []);

  return (
    <section id="projects" className="relative bg-bg">
      {reduced ? <StaticRail onOpen={setOpen} /> : <PinnedGallery onOpen={setOpen} />}

      {/* Day-job work */}
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-10 pt-16 pb-28 md:pt-24 md:pb-40">
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

      <ProjectModal project={open} onClose={closeDetails} onVideoOpen={setVideo} videoOpen={!!video} />
      {createPortal(<VideoModal src={video?.video ?? ''} open={!!video} onClose={closeVideo} title={video?.name ?? ''} />, document.body)}
    </section>
  );
}
