import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { StepRevealText, useRevealProgress, wordCount, type Segment } from '../shared/ScrollReveal';

const STATEMENT: Segment[] = ['Building web products and AI-powered tools that are correct at the edges and considered in motion.'];

const FOLLOW_UP: Segment[] = [
  { text: 'Anyone can get an LLM to say something clever.', className: 'text-fg' },
  " Getting it to say the right thing, every time, with a real user's data, is the part I actually enjoy. Schemas, evals, fallbacks, cost caps, and a healthy distrust of anything the model says.",
];

// Timeline in screen heights scrolled since the section's top passed 25% down the screen
// (it pins a quarter screen later). Words switch on one at a time, one per PER_WORD of a screen
// (breakthroughenergy.org's pace: about 29px of scroll per word on a 900px screen). The statement
// writes in, holds, then fades as the follow-up writes in over it and holds for reading.
const PER_WORD = 0.032;
const LEAD = 0.25;
const STATEMENT_IN: [number, number] = [0.1, 0.1 + wordCount(STATEMENT) * PER_WORD];
const FADE: [number, number] = [STATEMENT_IN[1] + 0.4, STATEMENT_IN[1] + 0.6];
const FOLLOW_UP_IN: [number, number] = [FADE[1] + 0.05, FADE[1] + 0.05 + wordCount(FOLLOW_UP) * PER_WORD];
const END = FOLLOW_UP_IN[1] + 0.4;
const SCROLL_VH = END - LEAD;
const at = ([from, to]: [number, number]): [number, number] => [from / END, to / END];

const statementClass = 'display-type text-[clamp(1.75rem,3.6vw,3.1rem)] leading-[1.25] tracking-[-0.025em]';
// Not .display-type: its line-height 1 suits a headline but crowds a paragraph
const followUpClass = 'leading-[1.4] tracking-[-0.015em] text-fg/70';

/** Reduce Motion: both texts in normal flow, shown in full */
function StackedIntro() {
  const statementRef = useRef<HTMLHeadingElement>(null);
  const followUpRef = useRef<HTMLParagraphElement>(null);
  const statementProgress = useRevealProgress(statementRef, ['start 85%', 'end 50%']);
  const followUpProgress = useRevealProgress(followUpRef, ['start 85%', 'end 50%']);

  return (
    <section id="intro" className="relative bg-bg py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <h2 ref={statementRef} className={statementClass}>
          <StepRevealText segments={STATEMENT} progress={statementProgress} />
        </h2>
        <p ref={followUpRef} className={`mt-8 text-[clamp(1.25rem,2.3vw,2rem)] ${followUpClass}`}>
          <StepRevealText segments={FOLLOW_UP} progress={followUpProgress} />
        </p>
      </div>
    </section>
  );
}

export function Intro() {
  return useReducedMotion() ? <StackedIntro /> : <PinnedIntro />;
}

function PinnedIntro() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Follows the scroll both ways: scrolling back switches words off and brings the statement back
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 25%', 'end end'] });
  const statementOpacity = useTransform(scrollYProgress, at(FADE), [1, 0]);
  const followUpOpacity = useTransform(scrollYProgress, at(FADE), [0, 1]);

  return (
    <section id="intro" className="relative bg-bg">
      {/* One screen for the pinned view plus the scroll distance of both reveals */}
      <div ref={trackRef} style={{ height: `${(SCROLL_VH + 1) * 100}vh` }}>
        {/* Clipped, so a line still sliding in from the right can't widen the page */}
        <div className="sticky top-0 flex items-center overflow-hidden" style={{ height: '100dvh' }}>
          {/* The statement cross-fades into the follow-up in the same cell. The RAG film now opens
              the next section (WorkTwirl), where it shrinks into the project cloud */}
          <div className="mx-auto grid w-full max-w-[1200px] items-center px-5 sm:px-8 md:px-10">
            <motion.h2 style={{ opacity: statementOpacity }} className={`col-start-1 row-start-1 md:max-w-[60%] ${statementClass}`}>
              <StepRevealText segments={STATEMENT} progress={scrollYProgress} range={at(STATEMENT_IN)} />
            </motion.h2>
            <motion.p style={{ opacity: followUpOpacity }} className={`col-start-1 row-start-1 text-[1.2rem] md:max-w-[70%] md:text-[clamp(1.25rem,2.1vw,1.9rem)] ${followUpClass}`}>
              <StepRevealText segments={FOLLOW_UP} progress={scrollYProgress} range={at(FOLLOW_UP_IN)} />
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
