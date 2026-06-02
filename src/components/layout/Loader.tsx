import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

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

// Glitch frames for the name
const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#█▓▒░│┼╫';
function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

function GlitchText({ text, reveal }: { text: string; reveal: boolean }) {
  const [display, setDisplay] = useState(text.split('').map(() => randomChar()));
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iterRef = useRef(0);

  useEffect(() => {
    if (!reveal) return;
    const total = text.length;
    const run = () => {
      iterRef.current += 1;
      const iter = iterRef.current;
      setDisplay(text.split('').map((char, i) => {
        if (i < iter / 2.5) return char;
        return randomChar();
      }));
      if (iter < total * 2.8) {
        frameRef.current = setTimeout(run, 38);
      } else {
        setDisplay(text.split(''));
      }
    };
    frameRef.current = setTimeout(run, 60);
    return () => { if (frameRef.current) clearTimeout(frameRef.current); };
  }, [reveal, text]);

  return (
    <span className="inline-flex tracking-[0.12em]">
      {display.map((c, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: reveal ? 1 : 0 }}
          transition={{ delay: i * 0.03, duration: 0.2 }}
          className="inline-block"
        >
          {c === ' ' ? ' ' : c}
        </motion.span>
      ))}
    </span>
  );
}

function Counter({ progress }: { progress: number }) {
  const display = Math.round(progress * 100);
  return (
    <div className="font-mono tabular-nums" style={{ fontSize: 'clamp(5rem, 14vw, 11rem)', lineHeight: 1, letterSpacing: '-0.04em' }}>
      <span style={{ color: 'rgb(var(--fg))' }}>{String(display).padStart(2, '0')}</span>
      <span style={{ color: 'rgb(var(--accent) / 0.5)', fontSize: '0.45em', verticalAlign: 'super', marginLeft: '0.1em' }}>%</span>
    </div>
  );
}

export function Loader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'counting' | 'name' | 'exit'>('counting');
  const rawProgress = useMotionValue(0);
  const springProgress = useSpring(rawProgress, { stiffness: 60, damping: 18 });
  const [progressSnap, setProgressSnap] = useState(0);
  const [nameReveal, setNameReveal] = useState(false);

  // Drive the progress bar
  useEffect(() => {
    // Ramp to ~0.7 in 1.2s, then slow, then burst to 1
    const t1 = setTimeout(() => rawProgress.set(0.72), 50);
    const t2 = setTimeout(() => rawProgress.set(0.88), 1100);
    const t3 = setTimeout(() => rawProgress.set(1), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [rawProgress]);

  // Mirror spring value for counter display
  useEffect(() => {
    return springProgress.on('change', (v) => setProgressSnap(v));
  }, [springProgress]);

  // Sequence phases
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('name'), 2000);
    const t2 = setTimeout(() => setNameReveal(true), 2100);
    const t3 = setTimeout(() => setPhase('exit'), 3200);
    const t4 = setTimeout(() => onDone(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  const barWidth = useTransform(springProgress, [0, 1], ['0%', '100%']);
  const EXIT_DURATION = 0.65;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden select-none"
      style={{ background: 'rgb(var(--bg))' }}
      exit={{
        clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'],
        transition: { duration: EXIT_DURATION, ease: [0.76, 0, 0.24, 1] },
      }}
    >
      {/* Exit edge line — sits at the bottom edge of the loader as it wipes up */}
      {phase === 'exit' && (
        <motion.div
          className="fixed left-0 right-0 z-[102] pointer-events-none"
          style={{
            height: '2px',
            bottom: 0,
            background: `linear-gradient(90deg, transparent 0%, rgb(var(--accent)) 20%, rgb(var(--fg)) 50%, rgb(var(--accent)) 80%, transparent 100%)`,
            boxShadow: '0 0 12px 2px rgb(var(--accent) / 0.6), 0 0 30px 6px rgb(var(--accent) / 0.2)',
            originY: 0,
          }}
          initial={{ y: '0vh' }}
          animate={{ y: '-100vh' }}
          transition={{ duration: EXIT_DURATION, ease: [0.76, 0, 0.24, 1], delay: 0.6 }}
        />
      )}
      {/* Noise grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      {/* Accent glow blob */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: '60vmax', height: '60vmax',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse at center, rgb(var(--accent) / 0.12) 0%, transparent 65%)',
        }}
      />


      {/* Top-right label */}
      <motion.div
        className="absolute top-8 right-8 font-mono text-[10px] tracking-[0.25em] uppercase"
        style={{ color: 'rgb(var(--fg) / 0.35)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        kevin robin
      </motion.div>

      {/* Main center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <AnimatePresence mode="wait">
          {phase === 'counting' && (
            <motion.div
              key="counter"
              className="flex flex-col items-center gap-4"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.35, ease: 'easeIn' } }}
            >
              <Counter progress={progressSnap} />
              <motion.p
                className="font-mono text-[11px] tracking-[0.28em] uppercase"
                style={{ color: 'rgb(var(--accent) / 0.7)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                initializing
              </motion.p>
            </motion.div>
          )}

          {phase !== 'counting' && (
            <motion.div
              key="name"
              className="flex flex-col items-center gap-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div
                className="font-sans font-bold uppercase"
                style={{
                  fontSize: 'clamp(2.8rem, 9vw, 7.5rem)',
                  letterSpacing: '-0.02em',
                  color: 'rgb(var(--fg))',
                  lineHeight: 1,
                }}
              >
                <GlitchText text="Kevin Robin" reveal={nameReveal} />
              </div>
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span
                  className="block h-[1px] w-12"
                  style={{ background: 'rgb(var(--accent) / 0.6)' }}
                />
                <span
                  className="font-mono text-[11px] tracking-[0.3em] uppercase"
                  style={{ color: 'rgb(var(--accent))' }}
                >
                  Full-Stack Developer
                </span>
                <span
                  className="block h-[1px] w-12"
                  style={{ background: 'rgb(var(--accent) / 0.6)' }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom progress bar */}
      <div className="px-8 pb-10 flex flex-col gap-3">
        <div
          className="relative h-[1px] w-full overflow-hidden"
          style={{ background: 'rgb(var(--fg) / 0.08)' }}
        >
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{
              width: barWidth,
              background: 'linear-gradient(90deg, rgb(var(--accent) / 0.5), rgb(var(--accent)))',
            }}
          />
          {/* Glowing tip */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2"
            style={{
              left: barWidth,
              background: 'rgb(var(--accent))',
              boxShadow: '0 0 8px 2px rgb(var(--accent) / 0.8)',
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <motion.span
            className="font-mono text-[9px] tracking-[0.2em] uppercase"
            style={{ color: 'rgb(var(--fg) / 0.25)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            loading experience
          </motion.span>
          <motion.span
            className="font-mono text-[9px] tracking-[0.2em]"
            style={{ color: 'rgb(var(--fg) / 0.25)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {String(Math.round(progressSnap * 100)).padStart(3, '0')}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
