import { motion } from 'framer-motion';
import { RagPipeline } from './RagPipeline';

const STATEMENT = 'Building web products and AI-powered tools that are correct at the edges and considered in motion.';
const EASE = [0.76, 0, 0.24, 1] as const;

export function Intro() {
  const words = STATEMENT.split(' ');

  return (
    <section id="intro" className="relative bg-bg py-24 sm:py-32 md:py-44">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-10">
        <div className="md:max-w-[60%]">
          {/* The heading watches the viewport; masked words can't (their mask clips them to zero) */}
          <motion.h2
            className="display-type text-[clamp(1.75rem,3.6vw,3.1rem)] leading-[1.25] tracking-[-0.025em]"
            aria-label={STATEMENT}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
          >
            <span aria-hidden>
              {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em] mr-[0.25em]">
                  <motion.span
                    className="inline-block"
                    variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.7, ease: EASE, delay: 0.02 * i } } }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
          </motion.h2>
        </div>

        {/* Shows the AI side of "considered in motion": a RAG pipeline answering questions about my work */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 md:mt-20"
        >
          <RagPipeline />
        </motion.div>
      </div>
    </section>
  );
}
