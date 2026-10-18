import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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

const WORDS = ['Hello', 'നമസ്കാരം', 'नमस्ते', 'Bonjour', 'Hola', 'Ciao', 'こんにちは', 'Hallå', 'Guten Tag'];

// First greeting lingers, the rest flick past; the last one holds briefly before the exit
const FIRST_WORD_MS = 1000;
const WORD_MS = 150;
const LAST_WORD_MS = 250;

const BG = '#1E1611';
const EASE = [0.76, 0, 0.24, 1] as const;

export function Loader({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [size] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  // onDone is recreated on every App render — keep the timers from resetting
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (index === WORDS.length - 1) {
      const t = setTimeout(() => onDoneRef.current(), LAST_WORD_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIndex((i) => i + 1), index === 0 ? FIRST_WORD_MS : WORD_MS);
    return () => clearTimeout(t);
  }, [index]);

  // The panel extends 300px below the viewport with a bowed bottom edge,
  // which flattens as the panel slides up
  const { w, h } = size;
  const curvedPath = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h + 300} 0 ${h} L0 0`;
  const flatPath = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h} 0 ${h} L0 0`;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center select-none"
      style={{ background: BG }}
      initial={{ y: 0 }}
      exit={{ y: '-100vh', transition: { duration: 0.8, ease: EASE, delay: 0.2 } }}
    >
      <motion.p
        className="relative z-[1] text-white font-sans"
        style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75, transition: { duration: 1, delay: 0.2 } }}
      >
        {WORDS[index]}
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
