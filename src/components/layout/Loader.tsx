import { useEffect, useRef, useState } from 'react';
import { motion, useIsPresent } from 'framer-motion';
import { GREETING_HEIGHT_EM, GREETING_SHAPES, GREETING_VIEWBOX } from '../../data/greetingPaths';

const SESSION_KEY = 'kr-loader-seen';

export function useLoader() {
  const [done, setDone] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
  });
  const dismiss = () => {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
    setDone(true);
  };
  return { done, dismiss };
}

// Greeting outlines come from scripts/build-greeting-paths.mjs (npm run build:greetings):
// every word is split into the same number of letter shapes
const WORDS = GREETING_SHAPES;

// First greeting lingers, then each letter morphs into a random letter of the next word,
// starting at a random moment within SPREAD_MS; the last word holds briefly before the exit
const FIRST_WORD_MS = 800;
const MORPH_MS = 300;
const SPREAD_MS = 120; // 0 = all letters transform together
const HOLD_MS = 60;
const LAST_WORD_MS = 250;

// Fisher–Yates: a fresh random order of 0…n-1
function shuffled(n: number) {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Latte: the palette's taupe (dark-mode --muted), between the browns and the creams
const BG = '#A8967F';
const EASE = [0.76, 0, 0.24, 1] as const;

function MorphingWords({ onComplete }: { onComplete: () => void }) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const paths = pathRefs.current;
    let cancelled = false;
    let timeline: { kill: () => void } | null = null;
    let exitTimer = 0;
    const finish = () => {
      exitTimer = window.setTimeout(() => !cancelled && onCompleteRef.current(), LAST_WORD_MS);
    };

    // GSAP loads while the first greeting is on screen
    (async () => {
      const [{ gsap }, { MorphSVGPlugin }] = await Promise.all([import('gsap'), import('gsap/MorphSVGPlugin')]);
      if (cancelled) return;
      gsap.registerPlugin(MorphSVGPlugin);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // A step fits the latest-starting morph plus a beat where the word is fully formed,
      // so one letter's morphs never overlap
      const step = (SPREAD_MS + MORPH_MS + HOLD_MS) / 1000;
      const tl = gsap.timeline({ delay: FIRST_WORD_MS / 1000, onComplete: finish });

      WORDS.slice(1).forEach(({ shapes }, w) => {
        const at = w * step;
        // Every shape on screen becomes a randomly chosen shape of the next word; together
        // they still spell it out, but pieces travel across instead of sweeping in order
        const target = shuffled(shapes.length);
        paths.forEach((path, i) => {
          if (!path) return;
          const d = shapes[target[i]];
          // Reduced motion: swap outlines without the morph
          if (reduced) tl.set(path, { attr: { d } }, at + step);
          else tl.to(path, { morphSVG: { shape: d, type: 'linear' }, duration: MORPH_MS / 1000, ease: 'power2.inOut' }, at + (Math.random() * SPREAD_MS) / 1000);
        });
      });
      // Keep the last word on screen for its hold before the exit
      tl.to({}, { duration: HOLD_MS / 1000 });
      timeline = tl;
    })();

    return () => {
      cancelled = true;
      timeline?.kill();
      window.clearTimeout(exitTimer);
    };
  }, []);

  return (
    <>
      <svg
        viewBox={GREETING_VIEWBOX}
        style={{ height: `${GREETING_HEIGHT_EM}em` }}
        className="block w-auto max-w-[90vw] overflow-visible"
        aria-hidden
      >
        {WORDS[0].shapes.map((d, i) => (
          <path key={i} ref={(el) => { pathRefs.current[i] = el; }} d={d} fill="currentColor" />
        ))}
      </svg>
      <span className="sr-only">Loading</span>
    </>
  );
}

export function Loader({ onDone }: { onDone: () => void }) {
  const [size] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  // iOS Safari tints its status and tab bars from fixed elements touching the screen
  // edges, and keeps that tint after the loader slides away (its layout box never moves,
  // only its transform). Dropping the panel's own fill as the exit starts lets Safari
  // pick up the page colour again; the latte SVG below still paints the sliding panel.
  const isPresent = useIsPresent();

  // index.html paints the page in the loader colour before React mounts; the loader
  // covers the screen now, so hand the background back to the theme
  useEffect(() => {
    document.documentElement.style.removeProperty('background');
  }, []);

  // The panel extends 300px below the viewport with a bowed bottom edge,
  // which flattens as the panel slides up
  const { w, h } = size;
  const curvedPath = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h + 300} 0 ${h} L0 0`;
  const flatPath = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h} 0 ${h} L0 0`;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center select-none"
      style={{ background: isPresent ? BG : 'transparent' }}
      initial={{ y: 0 }}
      exit={{ y: '-100vh', transition: { duration: 0.8, ease: EASE, delay: 0.2 } }}
    >
      <motion.p
        className="relative z-[1] text-[#1E1611] font-sans"
        style={{ fontSize: 'clamp(2.4rem, 4.8vw, 3.3rem)', lineHeight: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9, transition: { duration: 1, delay: 0.2 } }}
      >
        <MorphingWords onComplete={onDone} />
      </motion.p>

      <svg
        className="absolute top-0 left-0 w-full pointer-events-none"
        style={{ height: 'calc(100% + 300px)' }}
        aria-hidden="true"
      >
        <motion.path
          fill={BG}
          initial={{ d: curvedPath }}
          exit={{ d: flatPath, transition: { duration: 0.7, ease: EASE, delay: 0.3 } }}
        />
      </svg>
    </motion.div>
  );
}
