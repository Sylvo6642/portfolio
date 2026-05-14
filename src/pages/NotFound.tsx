import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ConnectingDots } from '../components/layout/ConnectingDots';
import { useMagneticButton } from '../hooks/useMagneticButton';

const SPRING_CFG = { stiffness: 60, damping: 18 };

const GLITCH_CHARS = '!@#$%^&*<>?/\\|[]{}~';
const PURPLE_SHADES = ['#7c3aed', '#a78bfa', '#6d28d9', '#c4b5fd', '#4c1d95', '#ddd6fe'];

function useGlitchText(target: string, forceActive: boolean) {
  const [display, setDisplay] = useState(target);
  const [glitchColor, setGlitchColor] = useState<string | null>(null);
  const dead = useRef(false);

  useEffect(() => {
    dead.current = false;
    let glitchTimeout: ReturnType<typeof setTimeout>;
    let frameInterval: ReturnType<typeof setInterval>;

    function runGlitch() {
      if (dead.current) return;
      let iter = 0;
      frameInterval = setInterval(() => {
        if (dead.current) { clearInterval(frameInterval); return; }
        setGlitchColor(PURPLE_SHADES[Math.floor(Math.random() * PURPLE_SHADES.length)]);
        setDisplay(
          target.split('').map((char, i) =>
            i < iter ? char : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          ).join('')
        );
        iter += 0.4 + Math.random() * 0.8;
        if (iter >= target.length) {
          clearInterval(frameInterval);
          if (dead.current) return;
          setDisplay(target);
          setGlitchColor(null);
          scheduleNext();
        }
      }, 20 + Math.random() * 100);
    }

    function scheduleNext() {
      if (dead.current) return;
      const delay = forceActive ? 2000 + Math.random() * 1000 : 2000 + Math.random() * 4000;
      glitchTimeout = setTimeout(runGlitch, delay);
    }

    runGlitch();

    return () => {
      dead.current = true;
      clearTimeout(glitchTimeout);
      clearInterval(frameInterval);
      setDisplay(target);
      setGlitchColor(null);
    };
  }, [forceActive, target]);

  return { display, glitchColor };
}

function MagneticButton({ children, onClick, className }: {
  children: React.ReactNode;
  onClick?: () => void;
  className: string;
}) {
  const { ref, x, y, onMove, onLeave } = useMagneticButton(0.42);
  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
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

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  },
};

export function NotFound() {
  const { display: glitchText, glitchColor } = useGlitchText('404', false);

  // Subtle parallax on the 404 watermark
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, SPRING_CFG);
  const my = useSpring(rawY, SPRING_CFG);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      rawX.set(((e.clientX - w / 2) / (w / 2)) * 18);
      rawY.set(((e.clientY - h / 2) / (h / 2)) * 12);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawX, rawY]);

  return (
    <div ref={wrapRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">

      {/* Background dots */}
      <ConnectingDots className="opacity-40" />

      {/* Parallax watermark */}
      <motion.div
        aria-hidden
        style={{ x: mx, y: my }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <span
          className="text-[30vw] font-semibold leading-none tracking-tighter opacity-[0.03] text-fg"
          style={{ userSelect: 'none' }}
        >
          404
        </span>
      </motion.div>

      {/* Content */}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        {/* Label */}
        <motion.p
          variants={stagger.item}
          className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted mb-6"
        >
          error / not found
        </motion.p>

        {/* Glitch 404 */}
        <motion.div variants={stagger.item} className="relative mb-6">
          <motion.span
            className="block text-[11vw] md:text-[9rem] font-semibold leading-none tracking-tighter cursor-default select-none transition-colors duration-75"
            style={{ color: glitchColor ?? 'rgb(var(--accent))' }}
          >
            {glitchText}
          </motion.span>
          {/* Accent underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="h-[2px] bg-accent origin-left mt-1"
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={stagger.item}
          className="text-2xl md:text-3xl font-semibold tracking-tight mb-4"
        >
          You've wandered into the void.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={stagger.item}
          className="text-base text-muted leading-relaxed mb-10 max-w-sm"
        >
          Even my gym routine has better structure than this URL.
          Whatever you were looking for — it's not here, it's not me, and honestly, it might not exist.
        </motion.p>

        {/* Buttons */}
        <motion.div variants={stagger.item} className="flex flex-wrap items-center justify-center gap-3">
          <MagneticButton
            onClick={() => { window.location.href = '/'; }}
            className="group inline-flex items-center gap-2 rounded-full bg-fg text-bg px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.03]"
          >
            Back to Home
            <svg className="transition-transform group-hover:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </MagneticButton>

          <MagneticButton
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-full hairline px-6 py-3 text-sm transition-all hover:scale-[1.03] hover:bg-fg/5"
          >
            Go Back
          </MagneticButton>
        </motion.div>

        {/* Footer mono */}
        <motion.p
          variants={stagger.item}
          className="mt-16 font-mono text-[10px] tracking-[0.2em] uppercase text-muted/50"
        >
          kevinsylvester.xyz · {new Date().getFullYear()}
        </motion.p>
      </motion.div>
    </div>
  );
}
