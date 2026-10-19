import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, type RefObject } from 'react';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import { RagPipeline } from './RagPipeline';

const STATEMENT = 'Building web products and AI-powered tools that are correct at the edges and considered in motion.';

// Words stay unbroken (inline-block, no wrapping inside) while each character animates on its own
const WORDS = (() => {
  let index = 0;
  return STATEMENT.split(' ').map((word) => [...word].map((char) => ({ char, index: index++ })));
})();
const CHAR_COUNT = WORDS.flat().length;
// Each character fades over this share of the scroll range; their starts are spread across the rest
const CHAR_SPAN = 0.18;

/**
 * Scroll progress through `offset` that only ever moves forward: scrolling back up doesn't
 * undo it, so once something has been revealed it stays revealed. Phones and Reduce Motion
 * start complete (scroll-linked motion is what made iOS flicker).
 */
function useRevealProgress(target: RefObject<HTMLElement>, offset: ['start end' | `start ${number}%`, `start ${number}%`]) {
  const mobile = useMobileLayout();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset });
  const progress = useMotionValue(0);
  const skip = mobile || !!reduced;

  useEffect(() => {
    progress.set(skip ? 1 : Math.max(progress.get(), scrollYProgress.get()));
  }, [skip, progress, scrollYProgress]);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!skip && v > progress.get()) progress.set(v);
  });
  return progress;
}

function Char({ char, index, progress }: { char: string; index: number; progress: MotionValue<number> }) {
  // Slide left by character: each letter fades in from the right, one after another
  const start = (index / CHAR_COUNT) * (1 - CHAR_SPAN);
  const opacity = useTransform(progress, [start, start + CHAR_SPAN], [0, 1]);
  const x = useTransform(progress, [start, start + CHAR_SPAN], ['0.6em', '0em']);
  return (
    <motion.span className="inline-block" style={{ opacity, x }}>
      {char}
    </motion.span>
  );
}

export function Intro() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // The statement writes itself once it's well into view, finishing near the top, so the
  // whole reveal happens where the visitor is reading
  const textProgress = useRevealProgress(headingRef, ['start 70%', 'start 25%']);
  const cardProgress = useRevealProgress(cardRef, ['start 90%', 'start 50%']);
  const cardOpacity = useTransform(cardProgress, [0, 1], [0, 1]);
  const cardX = useTransform(cardProgress, [0, 1], [48, 0]);

  return (
    <section id="intro" className="relative bg-bg py-24 sm:py-32 md:py-44">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-10">
        <div className="md:max-w-[60%]">
          <h2 ref={headingRef} className="display-type text-[clamp(1.75rem,3.6vw,3.1rem)] leading-[1.25] tracking-[-0.025em]" aria-label={STATEMENT}>
            <span aria-hidden>
              {WORDS.map((chars, w) => (
                <span key={w} className="mr-[0.25em] inline-block whitespace-nowrap">
                  {chars.map(({ char, index }) => (
                    <Char key={index} char={char} index={index} progress={textProgress} />
                  ))}
                </span>
              ))}
            </span>
          </h2>
        </div>

        {/* Shows the AI side of "considered in motion": a RAG pipeline answering questions about my work.
            Fades in sliding left as it scrolls up into view */}
        <motion.div ref={cardRef} style={{ opacity: cardOpacity, x: cardX }} className="mt-14 md:mt-20">
          <RagPipeline />
        </motion.div>
      </div>
    </section>
  );
}
