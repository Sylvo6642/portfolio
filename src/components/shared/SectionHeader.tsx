import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/**
 * Phantom.land-style section header:
 * a hairline-top meta row with index + label, then a giant uppercase
 * headline where each word slides up out of an overflow mask.
 * The headline drifts slower than the page (parallax) while in view.
 */
export function SectionHeader({
  index,
  label,
  title,
  sub,
}: {
  index: string;
  label: string;
  title: string;
  sub?: string;
}) {
  const words = title.split(' ');
  const ref = useRef<HTMLDivElement>(null);

  // Parallax: title lags the scroll while the hairline above moves at page speed
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [48, -48]);

  return (
    <div ref={ref}>
      <div className="relative flex items-baseline justify-between pt-4 mb-8 md:mb-12">
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="absolute top-0 left-0 right-0 h-px origin-left"
          style={{ background: 'rgb(var(--edge) / var(--edge-alpha))' }}
        />
        <motion.span
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-[11px] tracking-[0.25em] uppercase text-muted"
        >
          ({index})
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-[11px] tracking-[0.25em] uppercase text-muted"
        >
          {label}
        </motion.span>
      </div>

      <motion.h2
        style={{ y, fontSize: 'clamp(2.6rem, 8vw, 7rem)' }}
        className="display-type"
        aria-label={title}
      >
        <span className="flex flex-wrap gap-x-[0.22em]" aria-hidden>
          {words.map((word, i) => (
            <span key={i} className="overflow-hidden inline-block pb-[0.08em] -mb-[0.08em]">
              <motion.span
                initial={{ y: '110%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, delay: i * 0.07, ease: [0.76, 0, 0.24, 1] }}
                className="inline-block"
              >
                {word}
              </motion.span>
            </span>
          ))}
        </span>
      </motion.h2>

      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-5 font-mono text-xs md:text-sm tracking-wide text-muted uppercase"
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}
