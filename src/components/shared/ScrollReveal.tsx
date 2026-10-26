import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

type Edge = 'start' | 'end';
type Offset = [`${Edge} ${Edge}` | `${Edge} ${number}%`, `${Edge} ${Edge}` | `${Edge} ${number}%`];

/**
 * A copy of `source` (0–1) that follows the scroll both ways, so scrolling back rewinds the
 * reveal. Reduce Motion stays complete.
 */
export function useScrollLinked(source: MotionValue<number>) {
  const skip = !!useReducedMotion();
  // Start complete when skipping, so nothing relies on a later update reaching the letters
  const progress = useMotionValue(skip ? 1 : source.get());

  useEffect(() => {
    progress.set(skip ? 1 : source.get());
  }, [skip, progress, source]);
  useMotionValueEvent(source, 'change', (v) => {
    if (!skip) progress.set(v);
  });
  return progress;
}

/** Scroll progress of `target` through `offset`, rewinding as the page scrolls back */
export function useRevealProgress(target: RefObject<HTMLElement>, offset: Offset) {
  const { scrollYProgress } = useScroll({ target, offset });
  return useScrollLinked(scrollYProgress);
}

/** Opacity and a short slide, driven by a slice [from, to] of a reveal progress */
export function useRevealStyle(progress: MotionValue<number>, from: number, to: number, { x = 0, y = 0 } = {}) {
  const opacity = useTransform(progress, [from, to], [0, 1]);
  const tx = useTransform(progress, [from, to], [x, 0]);
  const ty = useTransform(progress, [from, to], [y, 0]);
  return { opacity, x: tx, y: ty };
}

export type Segment = string | { text: string; className?: string };

type WordPart = { text: string; className?: string };

// Words run across segments when no space separates them ("nerd" + ","), each part keeping its styling
const segmentWords = (segments: Segment[]) => {
  const words: { word: string; parts: WordPart[] }[] = [];
  let open = false;
  for (const s of segments) {
    const { text, className } = typeof s === 'string' ? { text: s, className: undefined } : s;
    for (const piece of text.split(/(\s+)/)) {
      if (!piece) continue;
      if (/^\s+$/.test(piece)) {
        open = false;
      } else if (open) {
        const w = words[words.length - 1];
        w.word += piece;
        w.parts.push({ text: piece, className });
      } else {
        words.push({ word: piece, parts: [{ text: piece, className }] });
        open = true;
      }
    }
  }
  return words;
};

/** How many words `StepRevealText` will step through, for sizing its scroll range */
export const wordCount = (segments: Segment[]) => segmentWords(segments).length;

// Each line starts this far right (in em) and eases into place while its words switch on:
// breakthroughenergy.org's 100px at a 60px font
const LINE_SHIFT_EM = 1.67;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

function StepWord({ parts, at, line, progress, spanRef }: { parts: WordPart[]; at: number; line: { start: number; end: number }; progress: MotionValue<number>; spanRef: (el: HTMLSpanElement | null) => void }) {
  const opacity = useTransform(progress, (v) => (v >= at ? 1 : 0));
  // Every word on a line shares the line's slide, so the line moves as one
  const x = useTransform(progress, (v) => {
    const t = Math.min(1, Math.max(0, (v - line.start) / (line.end - line.start)));
    return `${LINE_SHIFT_EM * (1 - easeOutCubic(t))}em`;
  });
  return (
    <motion.span ref={spanRef} className="inline-block" style={{ opacity, x }}>
      {parts.map((p, i) => (
        <span key={i} className={p.className}>
          {p.text}
        </span>
      ))}
    </motion.span>
  );
}

/**
 * Word by word, each word switching fully on at its own point in `range` (no fade), while each
 * line slides in from the right as its words appear, landing as the next line starts. It follows
 * the scroll both ways, so scrolling back switches words off and slides lines back out
 * (the breakthroughenergy.org reveal). Screen readers get the plain text.
 */
export function StepRevealText({ segments, progress, range = [0, 1] }: { segments: Segment[]; progress: MotionValue<number>; range?: [number, number] }) {
  const words = segmentWords(segments);
  const [from, to] = range;
  const step = (to - from) / words.length;
  const at = (i: number) => from + (i + 0.5) * step;

  // Which line each word sits on, read from the layout (transforms don't affect offsetTop)
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const [lineStarts, setLineStarts] = useState<number[]>([0]);
  useLayoutEffect(() => {
    const measure = () => {
      const starts: number[] = [];
      let top = -Infinity;
      spans.current.forEach((el, i) => {
        if (el && el.offsetTop > top + 2) {
          starts.push(i);
          top = el.offsetTop;
        }
      });
      setLineStarts((prev) => (prev.join() === starts.join() ? prev : starts));
    };
    measure();
    // The block around the words: resize observers ignore inline elements
    const container = spans.current[0]?.parentElement?.parentElement;
    if (!container) return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [words.length]);

  // A line slides from just before its first word until just before the next line's first word
  const lineOf = (i: number) => {
    let l = 0;
    while (l + 1 < lineStarts.length && lineStarts[l + 1] <= i) l++;
    const next = lineStarts[l + 1] ?? words.length;
    return { start: at(lineStarts[l]) - step / 2, end: at(next) - step / 2 };
  };

  return (
    <>
      <span className="sr-only select-none">{words.map((w) => w.word).join(' ')}</span>
      <span aria-hidden>
        {words.map((w, i) => {
          const line = lineOf(i);
          return (
            <Fragment key={`${i}-${line.start}`}>
              {i > 0 && ' '}
              <StepWord parts={w.parts} at={at(i)} line={line} progress={progress} spanRef={(el) => (spans.current[i] = el)} />
            </Fragment>
          );
        })}
      </span>
    </>
  );
}
