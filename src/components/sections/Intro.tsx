import { motion } from 'framer-motion';
import { useRef } from 'react';
import { RevealText, useRevealProgress, useRevealStyle } from '../shared/ScrollReveal';
import { RagVideo } from './RagVideo';

const STATEMENT = 'Building web products and AI-powered tools that are correct at the edges and considered in motion.';

export function Intro() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // The statement writes itself once it's well into view, finishing near the top, so the
  // whole reveal happens where the visitor is reading; spread over most of a screen of
  // scrolling, so it doesn't rush past at a normal pace
  const textProgress = useRevealProgress(headingRef, ['start 75%', 'start 5%']);
  const cardProgress = useRevealProgress(cardRef, ['start 95%', 'start 35%']);
  const cardStyle = useRevealStyle(cardProgress, 0, 1, { x: 48 });

  return (
    <section id="intro" className="relative bg-bg py-24 sm:py-32 md:py-44">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-10">
        <div className="md:max-w-[60%]">
          <h2 ref={headingRef} className="display-type text-[clamp(1.75rem,3.6vw,3.1rem)] leading-[1.25] tracking-[-0.025em]">
            <RevealText segments={[STATEMENT]} progress={textProgress} />
          </h2>
        </div>

        {/* Shows the AI side of "considered in motion": a film of a RAG pipeline answering a question about my work.
            Fades in sliding left as it scrolls up into view */}
        <motion.div ref={cardRef} style={cardStyle} className="mt-14 md:mt-20 md:ml-auto md:max-w-[75%]">
          <RagVideo />
        </motion.div>
      </div>
    </section>
  );
}
