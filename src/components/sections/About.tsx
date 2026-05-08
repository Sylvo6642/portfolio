import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SectionReveal } from '../shared/SectionReveal';
import { FadeText } from '../shared/FadeText';
import { useCountUp } from '../../hooks/useCountUp';

const STATS = [
  { value: 2, suffix: '+', label: 'Years Experience' },
  { value: 5, suffix: '+', label: 'Tech Stacks' },
  { value: 4000, suffix: '+', label: 'Hours Coded' },
  { value: 113, suffix: '+', label: 'Bugs Squashed' },
  { value: 147, suffix: '+', label: 'APIs Built' },
  { value: null, suffix: '∞', label: 'Coffee Cups' },
];

function Stat({ value, suffix, label, start }: { value: number | null; suffix: string; label: string; start: boolean }) {
  const v = useCountUp(value ?? 0, 1500, start);
  return (
    <div className="flex flex-col">
      <span className="text-5xl md:text-6xl font-bold tracking-tight tabular-nums">
        {value === null ? '' : Math.round(v)}
        <span className="text-accent">{suffix}</span>
      </span>
      <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mt-2">
        {label}
      </span>
    </div>
  );
}

function PhotoFrame() {
  const frameRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <div ref={frameRef} className="relative flex items-center justify-center">
      {/* Large faint number behind photo */}
      <span
        className="pointer-events-none absolute font-mono font-bold select-none"
        style={{
          fontSize: 'clamp(8rem, 18vw, 16rem)',
          color: 'rgb(var(--accent) / 0.05)',
          lineHeight: 1,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -52%)',
          letterSpacing: '-0.06em',
          zIndex: 0,
        }}
      >
        KR
      </span>

      {/* Decorative accent border — offset behind */}
      <motion.div
        className="absolute rounded-2xl"
        style={{
          inset: 0,
          top: 14,
          left: 14,
          background: 'transparent',
          border: '1.5px solid rgb(var(--accent) / 0.4)',
          borderRadius: '1rem',
          zIndex: 1,
        }}
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
      />

      {/* Accent glow patch */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '60%',
          height: '40%',
          bottom: '-10%',
          left: '-5%',
          background: 'radial-gradient(ellipse, rgb(var(--accent) / 0.18) 0%, transparent 70%)',
          zIndex: 1,
          filter: 'blur(24px)',
        }}
      />

      {/* Photo with parallax */}
      <motion.div
        style={{ y, zIndex: 2 }}
        className="relative w-full"
        initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
        whileInView={{ opacity: 1, scale: 1, rotate: -1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="overflow-hidden"
          style={{ borderRadius: '1rem', aspectRatio: '3/4' }}
        >
          <motion.img
            src="/kevin.png"
            alt="Kevin Robin"
            className="w-full h-full object-cover object-top"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Subtle gradient overlay at bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgb(var(--bg) / 0.35) 0%, transparent 45%)',
              borderRadius: '1rem',
            }}
          />
        </div>

        {/* Floating tag */}
        <motion.div
          className="absolute -bottom-4 -right-4 font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 hairline rounded-full backdrop-blur-sm"
          style={{ background: 'rgb(var(--bg) / 0.85)', color: 'rgb(var(--accent))' }}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Full-Stack Dev
        </motion.div>
      </motion.div>
    </div>
  );
}

export function About() {
  const statsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(statsRef, { once: true, amount: 0.4 });

  return (
    <section id="about" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-10">
            01 / about
          </p>
        </SectionReveal>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
          {/* LEFT — Photo */}
          <SectionReveal delay={0.1}>
            <div className="max-w-sm mx-auto md:mx-0 w-full">
              <PhotoFrame />
            </div>
          </SectionReveal>

          {/* RIGHT — Text */}
          <div className="flex flex-col">
            <SectionReveal delay={0.2}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15]">
                Full-Stack Developer with{' '}
                <span className="text-accent">2+ years</span> building scalable ERP and web systems.
              </h2>
            </SectionReveal>

            <p className="mt-3 font-mono text-sm text-fg/45 tracking-wide">
              <FadeText text="A developer who obsesses over the details others skip." delay={0.3} />
            </p>

            <SectionReveal delay={0.3}>
              <p className="mt-6 text-lg text-fg/75 leading-relaxed">
                Based in Kozhikode, Kerala. Currently at{' '}
                <span className="text-fg font-medium">Indeeya® (Lidex Tech)</span> working with
                Django, Angular, and MongoDB. Expanding into React, Node.js, Supabase, and
                PostgreSQL — chasing the full picture from data layer to delivered pixel.
              </p>
            </SectionReveal>

            {/* Stats */}
            <motion.div
              ref={statsRef}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-8 hairline-t pt-8"
            >
              {STATS.map((s) => (
                <Stat key={s.label} {...s} start={inView} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
