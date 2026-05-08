import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SectionReveal } from '../shared/SectionReveal';
import { FadeText } from '../shared/FadeText';
import { EXPERIENCE, durationMonths, formatDuration, type Experience as Exp } from '../../data/experience';
import { useCountUp } from '../../hooks/useCountUp';

function DurationBadge({ start, end, inView }: { start: string; end: string | null; inView: boolean }) {
  const totalMonths = durationMonths(start, end);
  const v = useCountUp(totalMonths, 1300, inView);
  return (
    <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-muted">
      {formatDuration(Math.round(v))}
    </span>
  );
}

function TimelineEntry({ entry, idx }: { entry: Exp; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const isLeft = idx % 2 === 0;

  return (
    <div ref={ref} className="relative md:grid md:grid-cols-2 md:gap-12 mb-20 last:mb-0">
      {/* Dot on the timeline */}
      <motion.span
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="absolute left-[14px] md:left-1/2 top-2 -translate-x-1/2 h-3 w-3 rounded-full bg-accent ring-4 ring-bg"
      />

      {/* Date side */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`pl-10 md:pl-0 md:pr-8 ${isLeft ? 'md:text-right md:order-1' : 'md:text-left md:order-2'} mb-3 md:mb-0`}
      >
        <span className="font-mono text-xs tracking-[0.15em] uppercase text-muted">
          {entry.start} — {entry.end ?? 'Present'}
        </span>
        <div className="mt-1">
          <DurationBadge start={entry.start} end={entry.end} inView={inView} />
        </div>
        <div className="mt-1 text-xs text-muted">{entry.location}</div>
      </motion.div>

      {/* Card side */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`pl-10 md:pl-8 ${isLeft ? 'md:order-2' : 'md:order-1 md:pl-0 md:pr-8'}`}
      >
        <div className="hairline rounded-xl p-6 bg-bg/40 backdrop-blur-sm transition-all duration-200 hover:border-l-2 hover:border-l-accent hover:bg-fg/[0.02]">
          <h3 className="text-xl font-semibold tracking-tight">{entry.role}</h3>
          <p className="mt-1 font-mono text-sm text-accent">{entry.company}</p>
          <ul className="mt-4 space-y-2 text-sm text-fg/75">
            {entry.bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <span className="text-accent shrink-0">→</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export function Experience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="experience" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-6">
            03 / experience
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Where I've shipped.
          </h2>
        </SectionReveal>

        <p className="mt-4 text-base text-fg/50">
          <FadeText text="Two years in. Still just getting started." delay={0.2} />
        </p>

        <div ref={containerRef} className="relative mt-16">
          {/* Background guide line */}
          <span
            aria-hidden
            className="absolute left-[14px] md:left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-fg/10"
          />
          {/* Animated draw line */}
          <motion.span
            aria-hidden
            style={{ scaleY: lineScale, transformOrigin: 'top' }}
            className="absolute left-[14px] md:left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-accent"
          />

          <div className="relative">
            {EXPERIENCE.map((e, i) => (
              <TimelineEntry key={e.role + e.company} entry={e} idx={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
