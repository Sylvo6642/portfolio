import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ConnectingDots } from '../layout/ConnectingDots';
import { scrollToId } from '../../lib/scroll';
import { useIsCoarsePointer } from '../../hooks/useMousePosition';

// Set to your CV URL to show the Download CV button, or leave empty to hide it
const CV_URL = "";

const ROTATING = [
  "Full-Stack Developer",
  "Building Scalable Web Systems",
  "Crafting ERP & Web Solutions",
  "Turning Ideas Into Production Code",
];


// Parallax layer configs: [dotsMultiplier, watermarkMultiplier, contentMultiplier]
// Each value is how much the layer shifts relative to mouse (in px per half-screen)
const LAYER_DOTS = 0.012;
const LAYER_MARK = 0.022;
const LAYER_TEXT = 0.008;

const SPRING_CFG = { stiffness: 60, damping: 18 };

function MagneticButton({
  children,
  className,
  onClick,
  type,
}: {
  children: React.ReactNode;
  className: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      data-cursor="hover"
      className={className}
    >
      {children}
    </button>
  );
}

function MagneticAnchor({
  children,
  href,
  download,
  className,
}: {
  children: React.ReactNode;
  href: string;
  download?: boolean;
  className: string;
}) {
  return (
    <a
      href={href}
      download={download}
      data-cursor="hover"
      className={className}
    >
      {children}
    </a>
  );
}

const STAGGER_MS = 28;
const EXIT_MS = 400;

function SplitPhrase({ text, phase }: { text: string; phase: 'in' | 'out' | 'idle' }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => {
        let opacity = 0;
        let transform = 'translateY(65%) rotate(8deg)';
        let transition = '';

        if (phase === 'in') {
          opacity = 1;
          transform = 'translateY(0) rotate(0deg)';
          transition = `opacity .5s cubic-bezier(.22,1,.36,1) ${i * STAGGER_MS * 4}ms, transform .75s cubic-bezier(.22,1,.36,1) ${i * STAGGER_MS * 4}ms`;
        } else if (phase === 'out') {
          opacity = 0;
          transform = 'translateY(-65%) rotate(-6deg)';
          const rev = (words.length - 1 - i) * (STAGGER_MS * 2);
          transition = `opacity .3s cubic-bezier(.55,0,1,.45) ${rev}ms, transform .4s cubic-bezier(.55,0,1,.45) ${rev}ms`;
        } else {
          transition = 'none';
        }

        return (
          <span key={i} style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: '0.25em' }}>
            <span style={{ display: 'inline-block', opacity, transform, transition }}>
              {word}
            </span>
          </span>
        );
      })}
    </>
  );
}

export function Hero() {
  const coarse = useIsCoarsePointer();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out' | 'idle'>('idle');
  const HOLD_MS = 2400;

  useEffect(() => {
    // brief idle so chars start from below on mount, then fly in
    const t0 = window.setTimeout(() => setPhase('in'), 60);
    return () => window.clearTimeout(t0);
  }, []);

  useEffect(() => {
    const flyInDuration = ROTATING[phraseIndex].length * STAGGER_MS + 750;
    // after hold, fly out then advance index
    const t1 = window.setTimeout(() => {
      setPhase('out');
      const t2 = window.setTimeout(() => {
        setPhraseIndex(i => (i + 1) % ROTATING.length);
        setPhase('idle');
        const t3 = window.setTimeout(() => setPhase('in'), 40);
        return () => window.clearTimeout(t3);
      }, EXIT_MS + 100);
      return () => window.clearTimeout(t2);
    }, flyInDuration + HOLD_MS);
    return () => window.clearTimeout(t1);
  }, [phraseIndex]);

  // Raw mouse position (normalized -1 … 1 relative to viewport center)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, SPRING_CFG);
  const my = useSpring(rawY, SPRING_CFG);

  const handleMouse = useCallback(
    (e: MouseEvent) => {
      if (coarse) return;
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    },
    [coarse, rawX, rawY],
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [handleMouse]);

  // Derive per-layer translations (pixels)
  const half = typeof window !== 'undefined' ? window.innerWidth / 2 : 768;
  const dotsX = useTransform(mx, [-1, 1], [-half * LAYER_DOTS, half * LAYER_DOTS]);
  const dotsY = useTransform(my, [-1, 1], [-half * LAYER_DOTS, half * LAYER_DOTS]);
  const markX  = useTransform(mx, [-1, 1], [-half * LAYER_MARK,  half * LAYER_MARK]);
  const markY  = useTransform(my, [-1, 1], [-half * LAYER_MARK,  half * LAYER_MARK]);
  const textX  = useTransform(mx, [-1, 1], [-half * LAYER_TEXT,  half * LAYER_TEXT]);
  const textY  = useTransform(my, [-1, 1], [-half * LAYER_TEXT,  half * LAYER_TEXT]);

  const scrollTo = (id: string) => {
    scrollToId(id);
  };

  // Exit transition — as the hero scrolls away, the content recedes:
  // drifts up at half speed, shrinks slightly, and fades out.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const exitY = useTransform(exitProgress, [0, 1], [0, -110]);
  const exitScale = useTransform(exitProgress, [0, 1], [1, 0.93]);
  const exitOpacity = useTransform(exitProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-end overflow-hidden hairline-b"
    >
      {/* Layer 1 — particles (slowest) */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={coarse ? {} : { x: dotsX, y: dotsY }}
      >
        <ConnectingDots />
      </motion.div>

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgb(var(--bg) / 0) 0%, rgb(var(--bg) / 0.55) 70%, rgb(var(--bg) / 0.85) 100%)',
        }}
      />

      {/* Layer 2 — watermark (medium) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        style={coarse ? {} : { x: markX, y: markY }}
      >
        <span
          className="display-type stroke-text opacity-[0.07]"
          style={{ fontSize: 'clamp(3.5rem, 16vw, 16rem)' }}
        >
          DEVELOPER
        </span>
      </motion.div>

      {/* Layer 3 — content (exit transforms on the outer layer, mouse parallax inside) */}
      <motion.div
        className="relative mx-auto max-w-[1400px] px-6 pt-32 pb-10 md:pb-14 w-full flex-1 flex flex-col justify-center"
        style={{ y: exitY, scale: exitScale, opacity: exitOpacity }}
      >
      <motion.div style={coarse ? {} : { x: textX, y: textY }}>
        {/* Meta row */}

        {/* Giant stacked name */}
        <h1
          className="display-type"
          style={{ fontSize: 'clamp(4rem, 14.5vw, 13rem)' }}
          aria-label="Kevin Robin — Full-Stack Developer"
        >
          <span className="block overflow-hidden pb-[0.06em] -mb-[0.06em]" aria-hidden>
            <motion.span
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.76, 0, 0.24, 1] }}
              className="block"
            >
              Kevin
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.06em] -mb-[0.06em]" aria-hidden>
            <motion.span
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.9, delay: 0.28, ease: [0.76, 0, 0.24, 1] }}
              className="block stroke-text"
            >
              Robin
            </motion.span>
          </span>
        </h1>

        {/* Rotating role line + CTAs */}
        <div className="mt-8 md:mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="font-mono text-xs md:text-sm tracking-[0.18em] uppercase text-fg/70 max-w-md"
            aria-label={ROTATING[phraseIndex]}
          >
            <span className="text-muted mr-3" aria-hidden>—</span>
            <span aria-hidden>
              <SplitPhrase text={ROTATING[phraseIndex]} phase={phase} />
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-wrap items-center gap-3"
          >
            <MagneticButton
              onClick={() => scrollTo('experience')}
              className="group inline-flex items-center gap-3 bg-fg text-bg px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-transform hover:scale-[1.02]"
            >
              View Work
              <svg className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </MagneticButton>

            <MagneticButton
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center gap-3 hairline px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:bg-fg hover:text-bg"
            >
              Get in Touch
            </MagneticButton>

            {CV_URL && (
              <MagneticAnchor
                href={CV_URL}
                download
                className="inline-flex items-center gap-3 hairline px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:bg-fg hover:text-bg"
              >
                Download CV
              </MagneticAnchor>
            )}
          </motion.div>
        </div>
      </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase">scroll</span>
        <div className="h-10 w-[1px] bg-fg/20 relative overflow-hidden">
          <motion.div
            className="absolute inset-x-0 top-0 h-3 bg-fg"
            animate={{ y: [-12, 40] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
