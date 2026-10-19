import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import { RevealText, type Segment } from '../shared/ScrollReveal';

const NAME = 'Kevin Robin';
// Percent of one copy's width travelled per second when the page is still
const BASE_SPEED = 4;

/** Written in letter by letter like the About page when there's a `progress`, else plain text */
function Write({ segments, progress, range }: { segments: Segment[]; progress: MotionValue<number> | null; range: [number, number] }) {
  if (progress) return <RevealText segments={segments} progress={progress} range={range} />;
  return <>{segments.map((s) => (typeof s === 'string' ? s : <span key={s.text} className={`inline-block ${s.className ?? ''}`}>{s.text}</span>))}</>;
}

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/**
 * Endless name ticker. Always drifts right to left, so the name reads naturally;
 * scrolling either way speeds it up.
 */
function NameMarquee({ write }: { write: MotionValue<number> | null }) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });

  // Four copies: shifting by one copy (25% of the row) loops seamlessly
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let moveBy = -(BASE_SPEED / 4) * (delta / 1000);
    moveBy += moveBy * Math.abs(velocityFactor.get());
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden select-none" aria-hidden>
      <motion.div className="flex w-max whitespace-nowrap" style={{ x }}>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="display-type pr-[0.3em] text-[22vw] md:text-[15vw] leading-[1.15] tracking-[-0.04em]">
            {/* The first copy (the one on screen) writes in first */}
            <Write segments={[`${NAME} `, { text: '—', className: 'px-[0.12em]' }]} progress={write} range={i === 0 ? [0, 0.7] : [0.3, 1]} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 globe-spin" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden>
      <circle cx="12" cy="12" r="9.5" />
      <ellipse cx="12" cy="12" rx="4.2" ry="9.5" />
      <path d="M2.5 12h19M4 7h16M4 17h16" />
    </svg>
  );
}

export function Hero({ ready = true, delay = 0 }: { ready?: boolean; delay?: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // The next section slides over the (sticky) hero — dim and settle it as it goes
  const { scrollY } = useScroll();
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const shade = useTransform(scrollY, [0, vh], [0, 0.55]);
  const photoY = useTransform(scrollY, [0, vh], [0, vh * 0.12]);
  const contentScale = useTransform(scrollY, [0, vh], [1, 0.94]);

  // The photo fades in first, then the text after it, letter by letter (a plain fade on phones,
  // where per-letter motion made iOS flicker, and with Reduce Motion)
  const mobile = useMobileLayout();
  const writes = !mobile && !reduced;
  const textProgress = useMotionValue(0);
  useEffect(() => {
    if (!ready || !writes) return;
    const controls = animate(textProgress, 1, { duration: 1.8, ease: 'linear', delay: delay + 0.5 });
    return () => controls.stop();
  }, [ready, writes, delay, textProgress]);
  const write = writes ? textProgress : null;

  const enter = (after: number) => ({
    initial: { opacity: 0 },
    animate: ready ? { opacity: 1 } : undefined,
    transition: { duration: 1.1, ease: 'easeOut', delay: delay + 0.4 + after },
  });

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-hero text-white"
      aria-label="Kevin Robin — Full-Stack & AI Engineer"
    >
      <motion.div className="absolute inset-0" style={reduced ? undefined : { scale: contentScale }}>
        {/* Cut-out portrait standing on the bottom edge; its edges are feathered and the cut-off
            table fades out at the sides (baked into the image), so it sits straight on the hero */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-[1] flex justify-center"
          style={reduced ? undefined : { y: photoY }}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ duration: 1.2, ease: 'easeOut', delay }}
        >
          <div className="w-[102vw] max-h-[78svh] md:w-auto md:h-[min(96svh,100vw)] aspect-[1199/1312]">
            <img
              src="/kevin-cutout.webp"
              alt=""
              className="h-full w-full object-contain object-bottom select-none pointer-events-none"
              draggable={false}
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </motion.div>

        {/* Location pill */}
        <motion.div
          {...enter(0.15)}
          className="hidden md:flex absolute z-[2] left-0 top-[46%] -translate-y-1/2 items-center gap-10 rounded-r-full bg-ink py-3 pl-10 pr-3"
        >
          <p className="text-[15px] leading-[1.35]">
            <Write segments={['Located']} progress={write} range={[0.45, 0.7]} />
            <br />
            <Write segments={['in Kerala,']} progress={write} range={[0.55, 0.85]} />
            <br />
            <Write segments={['India']} progress={write} range={[0.75, 1]} />
          </p>
          <span className="grid h-[68px] w-[68px] place-items-center rounded-full bg-hero">
            <Globe />
          </span>
        </motion.div>

        {/* Role */}
        <motion.div
          {...enter(0.25)}
          className="absolute z-[2] left-5 sm:left-8 top-[11svh] md:left-auto md:right-[7%] md:top-[30%]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="mb-5 md:mb-9" aria-hidden>
            <path d="M6 6l12 12M18 8v10H8" />
          </svg>
          <p className="text-[clamp(1.6rem,2.6vw,2.6rem)] leading-[1.25] tracking-[-0.02em]">
            <Write segments={['Full-Stack &']} progress={write} range={[0.2, 0.6]} />
            <br />
            <Write segments={['AI Engineer']} progress={write} range={[0.4, 0.8]} />
          </p>
        </motion.div>

        {/* Name ticker, behind the cut-out so it scrolls past behind me: across the table on
            desktop, behind my head on phones (where the figure fills the width) */}
        <motion.div {...enter(0)} className="absolute inset-x-0 top-[31svh] z-0 md:top-auto md:bottom-[4svh]">
          <NameMarquee write={write} />
        </motion.div>
      </motion.div>

      <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: shade }} />
      <h1 className="sr-only">Kevin Robin — Full-Stack Developer and AI Engineer based in Kerala, India</h1>
    </section>
  );
}
