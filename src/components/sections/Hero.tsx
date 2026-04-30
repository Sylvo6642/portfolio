import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useTypewriterSequence } from '../../hooks/useTypewriter';
import { ConnectingDots } from '../layout/ConnectingDots';

const NAME = "Hi, I'm Kevin Robin";

const ROTATING = [
  "A Full-Stack Developer",
  "A Gym Rat Who Ships Code",
  "Swimmer by Morning, Developer by Day",
  "Always One Semicolon Away From a Breakdown",
  "One Deployment Away From a Mental Breakdown",
];


export function Hero() {
  const phrases = useMemo(() => [NAME, ...ROTATING.map((r) => `Hi, I'm ${r}`)], []);

  const { text, done } = useTypewriterSequence(phrases, {
    typeMs: 70,
    eraseMs: 35,
    holdMs: 1800,
    finalHoldMs: 1800,
    startDelayMs: 250,
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden hairline-b"
    >
      {/* Connecting dots particle field */}
      <ConnectingDots />

      {/* Vignette to soften the dots near hero text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgb(var(--bg) / 0) 0%, rgb(var(--bg) / 0.55) 70%, rgb(var(--bg) / 0.85) 100%)',
        }}
      />

      {/* Faded background mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <span
          className="font-sans font-extrabold tracking-tighter text-fg/[0.035]"
          style={{ fontSize: 'clamp(8rem, 22vw, 22rem)', lineHeight: 1 }}
        >
          DEVELOPER
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24 w-full">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-6"
        >
          <span className="text-accent">●</span> available for select work
        </motion.p>

        <h1
          className="font-sans font-bold tracking-tight leading-[1.05]"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          aria-label={NAME}
        >
          <span aria-hidden>
            {text}
            <span className={`caret inline-block ml-1 ${done ? 'opacity-100' : ''}`}>
              <span className="inline-block w-[0.1em] h-[0.85em] align-[-0.05em] bg-fg" />
            </span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 max-w-2xl text-lg md:text-xl text-fg/80"
        >
          Full-Stack Developer{' '}
          <span className="text-fg/50">—</span>{' '}
          <span className="font-mono text-base text-fg/70">
            Django · Angular · React · Node.js
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <button
            type="button"
            onClick={() => scrollTo('experience')}
            data-cursor="hover"
            className="group relative inline-flex items-center gap-2 rounded-full bg-fg text-bg px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.03]"
          >
            View My Work
            <svg className="transition-transform group-hover:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollTo('contact')}
            data-cursor="hover"
            className="inline-flex items-center gap-2 rounded-full hairline px-6 py-3 text-sm transition-all hover:scale-[1.03] hover:bg-fg/5"
          >
            Get In Touch
          </button>
        </motion.div>

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
      </div>
    </section>
  );
}
