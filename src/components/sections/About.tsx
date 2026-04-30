import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionReveal } from '../shared/SectionReveal';
import { useCountUp } from '../../hooks/useCountUp';

const STATS = [
  { value: 2, suffix: '+', label: 'Years Experience' },
  { value: 5, suffix: '+', label: 'Tech Stacks' },
];

function Stat({ value, suffix, label, start }: { value: number; suffix: string; label: string; start: boolean }) {
  const v = useCountUp(value, 1500, start);
  return (
    <div className="flex flex-col">
      <span className="text-5xl md:text-6xl font-bold tracking-tight tabular-nums">
        {Math.round(v)}
        <span className="text-accent">{suffix}</span>
      </span>
      <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mt-2">
        {label}
      </span>
    </div>
  );
}

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section id="about" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-6">
            01 / about
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-4xl leading-[1.15]">
            Full-Stack Developer with{' '}
            <span className="text-accent">2+ years</span> building scalable ERP and web systems.
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <p className="mt-8 max-w-3xl text-lg text-fg/75 leading-relaxed">
            Based in Kozhikode, Kerala. Currently at{' '}
            <span className="text-fg">Indeeya® (Lidex Tech)</span> working with Django, Angular,
            and MongoDB. Expanding into React, Node.js, Supabase, and PostgreSQL — chasing the
            full picture from data layer to delivered pixel.
          </p>
        </SectionReveal>

        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 hairline-t pt-10"
        >
          {STATS.map((s) => (
            <Stat key={s.label} {...s} start={inView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
