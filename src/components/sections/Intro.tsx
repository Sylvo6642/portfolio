import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import { StepRevealText, useRevealProgress, useRevealStyle, wordCount, type Segment } from '../shared/ScrollReveal';
import { RagVideo } from './RagVideo';

const STATEMENT: Segment[] = ['Building web products and AI-powered tools that are correct at the edges and considered in motion.'];

const FOLLOW_UP: Segment[] = [
  { text: 'The model is the easy part.', className: 'text-fg' },
  " The engineering is everything around it: the schema it has to fill, the eval that catches it lying, the budget that stops it running up a bill. It's the API key that never reaches the browser, the tools it's allowed to call and nothing more, and the prompt injection it has to shrug off. Get those right and the model can be swapped out on a Friday afternoon. Get them wrong and no model will save you.",
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
const followUpClass = 'text-[clamp(1.25rem,2.3vw,2rem)] leading-[1.4] tracking-[-0.015em] text-fg/70';

/** The film, sliding in from the right as it scrolls up into view */
function FilmCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardProgress = useRevealProgress(cardRef, ['start 95%', 'start 35%']);
  const cardStyle = useRevealStyle(cardProgress, 0, 1, { x: 48 });

  // Shows the AI side of "considered in motion": a film of a RAG pipeline answering a question about my work
  return (
    <motion.div ref={cardRef} style={cardStyle} className="md:ml-auto md:max-w-[75%]">
      <RagVideo />
    </motion.div>
  );
}

export function Intro() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // Phones and Reduce Motion get both texts in normal flow, fully shown
  const stacked = useMobileLayout() || !!reduced;
  const shown = useMotionValue(1);

  // Follows the scroll both ways: scrolling back switches words off and brings the statement back
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 25%', 'end end'] });
  const statementOpacity = useTransform(scrollYProgress, at(FADE), [1, 0]);
  const followUpOpacity = useTransform(scrollYProgress, at(FADE), [0, 1]);

  if (stacked) {
    return (
      <section id="intro" className="relative bg-bg py-24 sm:py-32">
        <div ref={trackRef} className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <h2 className={statementClass}>
            <StepRevealText segments={STATEMENT} progress={shown} />
          </h2>
          <p className={`mt-8 ${followUpClass}`}>
            <StepRevealText segments={FOLLOW_UP} progress={shown} />
          </p>
          <div className="mt-14">
            <FilmCard />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="intro" className="relative bg-bg pb-24 sm:pb-32 md:pb-44">
      {/* One screen for the pinned view plus the scroll distance of both reveals */}
      <div ref={trackRef} style={{ height: `${(SCROLL_VH + 1) * 100}vh` }}>
        {/* Clipped, so a line still sliding in from the right can't widen the page */}
        <div className="sticky top-0 flex items-center overflow-hidden" style={{ height: '100dvh' }}>
          {/* Both texts share one grid cell and cross-fade in place */}
          <div className="mx-auto grid w-full max-w-[1200px] items-center px-5 sm:px-8 md:px-10">
            <motion.h2 style={{ opacity: statementOpacity }} className={`col-start-1 row-start-1 md:max-w-[60%] ${statementClass}`}>
              <StepRevealText segments={STATEMENT} progress={scrollYProgress} range={at(STATEMENT_IN)} />
            </motion.h2>
            <motion.p style={{ opacity: followUpOpacity }} className={`col-start-1 row-start-1 md:max-w-[72%] ${followUpClass}`}>
              <StepRevealText segments={FOLLOW_UP} progress={scrollYProgress} range={at(FOLLOW_UP_IN)} />
            </motion.p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-10">
        <FilmCard />
      </div>
    </section>
  );
}
