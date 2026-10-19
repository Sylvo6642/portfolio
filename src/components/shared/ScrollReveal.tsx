import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, type RefObject } from 'react';
import { useMobileLayout } from '../../hooks/useMobileLayout';

type Edge = 'start' | 'end';
type Offset = [`${Edge} ${Edge}` | `${Edge} ${number}%`, `${Edge} ${Edge}` | `${Edge} ${number}%`];

/**
 * Scroll progress through `offset` that only ever moves forward: scrolling back up doesn't
 * undo it, so once something has been revealed it stays revealed. Phones and Reduce Motion
 * start complete (scroll-linked motion is what made iOS flicker).
 */
export function useRevealProgress(target: RefObject<HTMLElement>, offset: Offset) {
  const mobile = useMobileLayout();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset });
  const skip = mobile || !!reduced;
  // Start complete when skipping, so nothing relies on a later update reaching the letters
  const progress = useMotionValue(skip ? 1 : 0);

  useEffect(() => {
    progress.set(skip ? 1 : Math.max(progress.get(), scrollYProgress.get()));
  }, [skip, progress, scrollYProgress]);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!skip && v > progress.get()) progress.set(v);
  });
  return progress;
}

/** Opacity and a short slide, driven by a slice [from, to] of a reveal progress */
export function useRevealStyle(progress: MotionValue<number>, from: number, to: number, { x = 0, y = 0 } = {}) {
  const opacity = useTransform(progress, [from, to], [0, 1]);
  const tx = useTransform(progress, [from, to], [x, 0]);
  const ty = useTransform(progress, [from, to], [y, 0]);
  return { opacity, x: tx, y: ty };
}

// Each character fades over this share of its range; their starts are spread across the rest
const CHAR_SPAN = 0.18;

function Char({ char, at, progress, range, className }: { char: string; at: number; progress: MotionValue<number>; range: [number, number]; className?: string }) {
  const [from, to] = range;
  const start = from + at * (1 - CHAR_SPAN) * (to - from);
  const end = start + CHAR_SPAN * (to - from);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const x = useTransform(progress, [start, end], ['0.6em', '0em']);
  return (
    <motion.span className={`inline-block ${className ?? ''}`} style={{ opacity, x }}>
      {char}
    </motion.span>
  );
}

export type Segment = string | { text: string; className?: string };

/**
 * Slide left by character: each letter fades in from the right, one after another, as
 * `progress` moves through `range`. Words stay unbroken; segments keep their own styling.
 * Screen readers get the plain text.
 */
export function RevealText({ segments, progress, range = [0, 1] }: { segments: Segment[]; progress: MotionValue<number>; range?: [number, number] }) {
  const chars = segments.flatMap((s) => {
    const { text, className } = typeof s === 'string' ? { text: s, className: undefined } : s;
    return [...text].map((char) => ({ char, className }));
  });
  const letters = chars.filter((c) => c.char !== ' ').length;

  const words: { char: string; className?: string; at: number }[][] = [[]];
  let n = 0;
  for (const c of chars) {
    if (c.char === ' ') words.push([]);
    else words[words.length - 1].push({ ...c, at: n++ / letters });
  }

  return (
    <>
      <span className="sr-only">{chars.map((c) => c.char).join('')}</span>
      <span aria-hidden>
        {words.filter((w) => w.length).map((word, w) => (
          <span key={w} className="mr-[0.25em] inline-block whitespace-nowrap">
            {word.map((c, i) => (
              <Char key={i} char={c.char} at={c.at} progress={progress} range={range} className={c.className} />
            ))}
          </span>
        ))}
      </span>
    </>
  );
}
