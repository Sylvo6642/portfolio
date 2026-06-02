import { motion, useMotionValue, useSpring, useTransform, LayoutGroup } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { ConnectingDots } from '../layout/ConnectingDots';
import { useMagneticButton } from '../../hooks/useMagneticButton';
import { useIsCoarsePointer } from '../../hooks/useMousePosition';

// Set to your CV URL to show the Download CV button, or leave empty to hide it
const CV_URL = "";

const ROTATING = [
  "Kevin Robin",
  "a Full-Stack Developer",
  "building Scalable Web Systems",
  "crafting ERP & Web Solutions",
  "turning Ideas Into Production Code",
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
  const { ref, x, y, onMove, onLeave } = useMagneticButton(0.42);
  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type ?? 'button'}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y }}
      data-cursor="hover"
      className={className}
    >
      {children}
    </motion.button>
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
  const { ref, x, y, onMove, onLeave } = useMagneticButton(0.42);
  return (
    <motion.a
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      download={download}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y }}
      data-cursor="hover"
      className={className}
    >
      {children}
    </motion.a>
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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden hairline-b"
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
          className="font-sans font-extrabold tracking-tighter text-fg/[0.035]"
          style={{ fontSize: 'clamp(3.5rem, 16vw, 16rem)', lineHeight: 1 }}
        >
          DEVELOPER
        </span>
      </motion.div>

      {/* Layer 3 — content (subtle, just enough to feel depth) */}
      <LayoutGroup>
      <motion.div
        layout
        className="relative mx-auto max-w-6xl px-6 py-24 w-full"
        style={coarse ? {} : { x: textX, y: textY }}
      >

        <motion.h1
          layout
          className="font-sans font-bold tracking-tight leading-[1.05]"
          style={{ fontSize: 'clamp(2.2rem, 6vw, 4.8rem)' }}
          transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          aria-label={`Hi, I'm ${ROTATING[phraseIndex]}`}
        >
          <span aria-hidden>{"Hi, I'm "}</span>
          <span aria-hidden>
            <SplitPhrase text={ROTATING[phraseIndex]} phase={phase} />
          </span>
        </motion.h1>

        <motion.p
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75, layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          className="mt-6 max-w-2xl text-lg md:text-xl text-fg/80"
        >
          Full-Stack Developer
        </motion.p>

        <motion.div
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1, layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          className="mt-10 flex flex-wrap items-center justify-center md:justify-start gap-3"
        >
          <MagneticButton
            onClick={() => scrollTo('experience')}
            className="group relative inline-flex items-center gap-2 rounded-full bg-fg text-bg px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.03]"
          >
            View My Work
            <svg className="transition-transform group-hover:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </MagneticButton>

          <MagneticButton
            onClick={() => scrollTo('contact')}
            className="inline-flex items-center gap-2 rounded-full hairline px-6 py-3 text-sm transition-all hover:scale-[1.03] hover:bg-fg/5"
          >
            Get In Touch
          </MagneticButton>

          {CV_URL && (
            <MagneticAnchor
              href={CV_URL}
              download
              className="group inline-flex items-center gap-2 rounded-full hairline px-6 py-3 text-sm transition-all hover:scale-[1.03] hover:bg-fg/5"
            >
              Download CV
              <svg className="transition-transform group-hover:translate-y-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </MagneticAnchor>
          )}
        </motion.div>

      </motion.div>
      </LayoutGroup>

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
