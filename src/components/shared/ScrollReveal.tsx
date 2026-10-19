import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Fragment, useEffect, type RefObject } from 'react';
import { useMobileLayout } from '../../hooks/useMobileLayout';

type Edge = 'start' | 'end';
type Offset = [`${Edge} ${Edge}` | `${Edge} ${number}%`, `${Edge} ${Edge}` | `${Edge} ${number}%`];

/**
 * A copy of `source` (0–1) that only ever moves forward: going back doesn't undo it, so once
 * something has been revealed it stays revealed. Phones and Reduce Motion start complete
 * (scroll-linked motion is what made iOS flicker).
 */
export function useForwardOnly(source: MotionValue<number>) {
  const mobile = useMobileLayout();
  const reduced = useReducedMotion();
  const skip = mobile || !!reduced;
  // Start complete when skipping, so nothing relies on a later update reaching the letters
  const progress = useMotionValue(skip ? 1 : 0);

  useEffect(() => {
    progress.set(skip ? 1 : Math.max(progress.get(), source.get()));
  }, [skip, progress, source]);
  useMotionValueEvent(source, 'change', (v) => {
    if (!skip && v > progress.get()) progress.set(v);
  });
  return progress;
}

/** Forward-only scroll progress of `target` through `offset` */
export function useRevealProgress(target: RefObject<HTMLElement>, offset: Offset) {
  const { scrollYProgress } = useScroll({ target, offset });
  return useForwardOnly(scrollYProgress);
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

function Piece({ text, at, progress, range, className, span }: { text: string; at: number; progress: MotionValue<number>; range: [number, number]; className?: string; span: number }) {
  const [from, to] = range;
  const start = from + at * (1 - span) * (to - from);
  const end = start + span * (to - from);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const x = useTransform(progress, [start, end], ['0.6em', '0em']);
  return (
    <motion.span className={`inline-block ${className ?? ''}`} style={{ opacity, x }}>
      {text}
    </motion.span>
  );
}

export type Segment = string | { text: string; className?: string };

// Words are fewer and longer than letters, so each takes a bigger share of the range
const WORD_SPAN = 0.3;

/**
 * Slide left by character (or by word, for longer copy): each letter fades in from the right,
 * one after another, as `progress` moves through `range`. Words stay unbroken; segments keep
 * their own styling. Screen readers get the plain text.
 */
export function RevealText({ segments, progress, range = [0, 1], unit = 'char' }: { segments: Segment[]; progress: MotionValue<number>; range?: [number, number]; unit?: 'char' | 'word' }) {
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

  const filled = words.filter((w) => w.length);
  return (
    <>
      {/* Not selectable, so copying the visible text doesn't paste it twice */}
      <span className="sr-only select-none">{chars.map((c) => c.char).join('')}</span>
      <span aria-hidden>
        {filled.map((word, w) => (
          // Real spaces between words, so copied text reads normally
          <Fragment key={w}>
            {w > 0 && ' '}
            {unit === 'word' ? (
              // A word may mix styles (rare); it takes the styling of its first letter
              <Piece text={word.map((c) => c.char).join('')} at={w / filled.length} progress={progress} range={range} className={word[0].className} span={WORD_SPAN} />
            ) : (
              <span className="inline-block whitespace-nowrap">
                {word.map((c, i) => (
                  <Piece key={i} text={c.char} at={c.at} progress={progress} range={range} className={c.className} span={CHAR_SPAN} />
                ))}
              </span>
            )}
          </Fragment>
        ))}
      </span>
    </>
  );
}
