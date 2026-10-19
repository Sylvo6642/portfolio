import { motion } from 'framer-motion';
import { RagPipeline } from './RagPipeline';

const STATEMENT = 'Building web products and AI-powered tools that are correct at the edges and considered in motion.';
const EASE = [0.22, 1, 0.36, 1] as const;
const CHAR_STAGGER = 0.014;

// Words stay unbroken (inline-block, no wrapping inside) while each character animates on its own
const WORDS = (() => {
  let index = 0;
  return STATEMENT.split(' ').map((word) => [...word].map((char) => ({ char, index: index++ })));
})();

export function Intro() {
  return (
    <section id="intro" className="relative bg-bg py-24 sm:py-32 md:py-44">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-10">
        <div className="md:max-w-[60%]">
          {/* Slide left by character: each letter fades in from the right, one after another */}
          <motion.h2
            className="display-type text-[clamp(1.75rem,3.6vw,3.1rem)] leading-[1.25] tracking-[-0.025em]"
            aria-label={STATEMENT}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            <span aria-hidden>
              {WORDS.map((chars, w) => (
                <span key={w} className="mr-[0.25em] inline-block whitespace-nowrap">
                  {chars.map(({ char, index }) => (
                    <motion.span
                      key={index}
                      className="inline-block"
                      variants={{
                        hidden: { opacity: 0, x: '0.6em' },
                        show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE, delay: index * CHAR_STAGGER } },
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </span>
          </motion.h2>
        </div>

        {/* Shows the AI side of "considered in motion": a RAG pipeline answering questions about my work.
            Fades in sliding left, just after the heading */}
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1, ease: EASE, delay: 0.35 }}
          className="mt-14 md:mt-20"
        >
          <RagPipeline />
        </motion.div>
      </div>
    </section>
  );
}
