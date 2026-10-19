import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { useRef } from 'react';

const EASE = [0.76, 0, 0.24, 1] as const;
const NAME = 'Kevin Robin';
// Percent of one copy's width travelled per second when the page is still
const BASE_SPEED = 4;

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/**
 * Endless name ticker. Drifts left on its own; scrolling speeds it up and
 * scrolling back up flips its direction.
 */
function NameMarquee() {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  const direction = useRef(1);

  // Four copies: shifting by one copy (25% of the row) loops seamlessly
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    let moveBy = -direction.current * (BASE_SPEED / 4) * (delta / 1000);
    moveBy += moveBy * Math.abs(factor);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden select-none" aria-hidden>
      <motion.div className="flex w-max whitespace-nowrap" style={{ x }}>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="display-type pr-[0.3em] text-[28vw] md:text-[15vw] leading-[1.15] tracking-[-0.04em]">
            {NAME} <span className="inline-block px-[0.12em]">—</span>
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

export function Hero({ ready = true }: { ready?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // The next section slides over the (sticky) hero — dim and settle it as it goes
  const { scrollY } = useScroll();
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const shade = useTransform(scrollY, [0, vh], [0, 0.55]);
  const photoY = useTransform(scrollY, [0, vh], [0, vh * 0.12]);
  const contentScale = useTransform(scrollY, [0, vh], [1, 0.94]);

  const enter = (delay: number) => ({
    initial: { y: 60, opacity: 0 },
    animate: ready ? { y: 0, opacity: 1 } : undefined,
    transition: { duration: 1.1, ease: EASE, delay },
  });

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-hero text-white"
      aria-label="Kevin Robin — Full-Stack & AI Engineer"
    >
      <motion.div className="absolute inset-0" style={reduced ? undefined : { scale: contentScale }}>
        {/* Portrait in an arch, anchored to the bottom edge */}
        <motion.div
          className="absolute inset-x-0 bottom-0 flex justify-center"
          style={reduced ? undefined : { y: photoY }}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        >
          <div className="w-[78vw] max-h-[72svh] md:w-auto md:h-[min(84svh,85vw)] aspect-[3/4] overflow-hidden rounded-t-full">
            <img
              src="/kevin-cafe.jpg"
              alt=""
              className="h-full w-full object-cover object-[50%_30%] select-none pointer-events-none"
              draggable={false}
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </motion.div>

        {/* Location pill */}
        <motion.div
          {...enter(0.15)}
          className="hidden md:flex absolute left-0 top-[46%] -translate-y-1/2 items-center gap-10 rounded-r-full bg-ink py-3 pl-10 pr-3"
        >
          <p className="text-[15px] leading-[1.35]">
            Located
            <br />
            in Kerala,
            <br />
            India
          </p>
          <span className="grid h-[68px] w-[68px] place-items-center rounded-full bg-hero">
            <Globe />
          </span>
        </motion.div>

        {/* Role */}
        <motion.div
          {...enter(0.25)}
          className="absolute left-5 sm:left-8 top-[18svh] md:left-auto md:right-[7%] md:top-[30%]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="mb-5 md:mb-9" aria-hidden>
            <path d="M6 6l12 12M18 8v10H8" />
          </svg>
          <p className="text-[clamp(1.6rem,2.6vw,2.6rem)] leading-[1.25] tracking-[-0.02em]">
            Full-Stack &amp;
            <br />
            AI Engineer
          </p>
        </motion.div>

        {/* Name ticker */}
        <motion.div {...enter(0)} className="absolute inset-x-0 bottom-[3svh] md:bottom-[4svh]">
          <NameMarquee />
        </motion.div>
      </motion.div>

      <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: shade }} />
      <h1 className="sr-only">Kevin Robin — Full-Stack Developer and AI Engineer based in Kerala, India</h1>
    </section>
  );
}
