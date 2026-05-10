import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { useRef, useCallback, useState, useEffect, type RefObject, type MouseEvent } from 'react';
import { SectionReveal } from '../shared/SectionReveal';
import { useCountUp } from '../../hooks/useCountUp';

const STATS = [
  { value: 2, suffix: '+', label: 'Years Experience' },
  { value: 5, suffix: '+', label: 'Tech Stacks' },
  { value: 4000, suffix: '+', label: 'Hours Coded' },
  { value: 113, suffix: '+', label: 'Bugs Squashed' },
  { value: 147, suffix: '+', label: 'APIs Built' },
  { value: null, suffix: '∞', label: 'Coffee Cups' },
];

const PANELS = [
  { id: 'intro' },
  { id: 'philosophy' },
  { id: 'beyond' },
];

function Stat({ value, suffix, label, start }: { value: number | null; suffix: string; label: string; start: boolean }) {
  const v = useCountUp(value ?? 0, 1500, start);
  return (
    <div className="flex flex-col">
      <span className="text-4xl md:text-5xl font-bold tracking-tight tabular-nums">
        {value === null ? '' : Math.round(v)}
        <span className="text-accent">{suffix}</span>
      </span>
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted mt-1.5">
        {label}
      </span>
    </div>
  );
}

function TiltPhoto({ y }: { y: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const px = (e.clientX - left) / width - 0.5;
    const py = (e.clientY - top) / height - 0.5;
    rotX.set(-py * 7);
    rotY.set(px * 7);
  }, [rotX, rotY]);

  const onLeave = useCallback(() => {
    rotX.set(0);
    rotY.set(0);
  }, [rotX, rotY]);

  return (
    <motion.div
      ref={ref}
      style={{ y, zIndex: 2, rotateX: rotX, rotateY: rotY, transformPerspective: 800 }}
      className="relative w-full"
      initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
      whileInView={{ opacity: 1, scale: 1, rotate: -1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="overflow-hidden" style={{ borderRadius: '1rem', aspectRatio: '3/4' }}>
        <motion.img
          src="/kevin.png"
          alt="Kevin Robin"
          className="w-full h-full object-cover object-top"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgb(var(--bg) / 0.35) 0%, transparent 45%)',
            borderRadius: '1rem',
          }}
        />
      </div>
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
  );
}

function PhotoFrame() {
  const frameRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <div ref={frameRef} className="relative flex items-center justify-center">
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
      <TiltPhoto y={y} />
    </div>
  );
}

/* ─── Panel 1: Intro ─── */
function PanelIntro({ statsRef, inView }: { statsRef: RefObject<HTMLDivElement>; inView: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center h-full">
      <div className="max-w-sm mx-auto md:mx-0 w-full">
        <PhotoFrame />
      </div>
      <div className="flex flex-col">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15]"
        >
          Full-Stack Developer with{' '}
          <span className="text-accent">2+ years</span> building scalable ERP and web systems.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 font-mono text-sm text-fg/45 tracking-wide"
        >
          A developer who obsesses over the details others skip.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-lg text-fg/75 leading-relaxed"
        >
          Based in Kozhikode, Kerala. Currently at{' '}
          <span className="text-fg font-medium">Indeeya® (Lidex Tech)</span> working with
          Django, Angular, and MongoDB. Expanding into React, Node.js, Supabase, and
          PostgreSQL — chasing the full picture from data layer to delivered pixel.
        </motion.p>
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
  );
}

/* ─── Panel 2: Philosophy ─── */
function PanelPhilosophy() {
  const principles = [
    {
      icon: '◈',
      title: 'Detail-obsessed',
      body: 'The gap between good and great lives in the details others skip — a 2px margin, a 12ms transition, the right word in a label.',
    },
    {
      icon: '◎',
      title: 'Systems thinker',
      body: 'I think in layers. Every feature I build connects up to product intent and down to database schema — nothing exists in isolation.',
    },
    {
      icon: '◐',
      title: 'Shipping bias',
      body: 'Perfect is the enemy of shipped. I move fast, iterate in production, and let real usage shape the next revision.',
    },
  ];

  return (
    <div className="flex flex-col justify-center h-full max-w-3xl mx-auto w-full">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="font-mono text-xs tracking-[0.2em] uppercase text-accent mb-6"
      >
        How I work
      </motion.p>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.2] mb-12"
      >
        I build software the way I'd want to{' '}
        <span className="text-accent">use it</span> — fast, clear, and honest.
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
        {principles.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="hairline rounded-xl p-6 flex flex-col gap-3 hover:bg-fg/[0.03] transition-colors"
          >
            <span className="text-accent text-2xl leading-none">{p.icon}</span>
            <span className="font-semibold text-base">{p.title}</span>
            <span className="text-sm text-fg/65 leading-relaxed">{p.body}</span>
          </motion.div>
        ))}
      </div>

      <motion.blockquote
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative pl-6"
        style={{ borderLeft: '2px solid rgb(var(--accent) / 0.5)' }}
      >
        <p className="text-lg md:text-xl text-fg/70 italic leading-relaxed">
          "Any fool can write code that a computer can understand. Good programmers write code
          that humans can understand."
        </p>
        <footer className="mt-3 font-mono text-xs tracking-[0.15em] uppercase text-muted">
          — Martin Fowler
        </footer>
      </motion.blockquote>
    </div>
  );
}

/* ─── Panel 3: Beyond Code ─── */
function PanelBeyond() {
  const interests = [
    { label: 'UI/UX Design', icon: '✦' },
    { label: 'Open Source', icon: '◈' },
    { label: 'System Design', icon: '◎' },
    { label: 'Tech Writing', icon: '◐' },
    { label: 'Chess', icon: '♟' },
    { label: 'Malayalam Music', icon: '♪' },
    { label: 'Sci-fi novels', icon: '◉' },
    { label: 'Long walks', icon: '◌' },
  ];

  const currentStack = [
    { name: 'React + Vite', note: 'this portfolio' },
    { name: 'Supabase', note: 'backend experiments' },
    { name: 'Framer Motion', note: 'animation layer' },
    { name: 'Tailwind CSS', note: 'styling system' },
  ];

  return (
    <div className="flex flex-col justify-center h-full max-w-3xl mx-auto w-full">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="font-mono text-xs tracking-[0.2em] uppercase text-accent mb-6"
      >
        Beyond the code
      </motion.p>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.2] mb-10"
      >
        A person, not just a{' '}
        <span className="text-accent">stack.</span>
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-4">
            Interests
          </p>
          <div className="flex flex-wrap gap-2">
            {interests.map((item, i) => (
              <motion.span
                key={item.label}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                className="inline-flex items-center gap-1.5 hairline rounded-full px-3 py-1.5 text-sm hover:bg-fg/5 transition-colors"
              >
                <span className="text-accent text-xs">{item.icon}</span>
                {item.label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Currently building with */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-4">
            Currently building with
          </p>
          <div className="flex flex-col gap-3">
            {currentStack.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.07 }}
                className="flex items-center justify-between hairline-b pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium">{item.name}</span>
                <span className="font-mono text-[10px] text-muted tracking-wide">{item.note}</span>
              </motion.div>
            ))}
          </div>

          {/* Location card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6 hairline rounded-xl p-4 flex items-center gap-3 bg-fg/[0.02]"
          >
            <span className="text-accent text-lg">◎</span>
            <div>
              <p className="text-sm font-medium">Kozhikode, Kerala</p>
              <p className="font-mono text-[10px] text-muted tracking-wide mt-0.5">
                UTC +5:30 · Available remotely
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Horizontal scroll container (desktop only) ─── */
function HorizontalAbout({ statsRef, inView }: { statsRef: RefObject<HTMLDivElement>; inView: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));
  const isMobile = vw < 768;

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 280, damping: 32, restDelta: 0.001 });
  const totalShift = -(PANELS.length - 1) * vw;
  // Use [0.12, 0.88] so sliding only starts after a full viewport of buffer
  // at the top and ends before the last viewport of the section exits
  const x = useTransform(smoothProgress, [0.12, 0.88], [0, totalShift]);

  const dot0 = useTransform(smoothProgress, [0.12, 0.42], [1, 0.35]);
  const dot1 = useTransform(smoothProgress, [0.3, 0.5, 0.7], [0.35, 1, 0.35]);
  const dot2 = useTransform(smoothProgress, [0.58, 0.88], [0.35, 1]);
  const dot0w = useTransform(dot0, [0.35, 1], [6, 20]);
  const dot1w = useTransform(dot1, [0.35, 1], [6, 20]);
  const dot2w = useTransform(dot2, [0.35, 1], [6, 20]);
  const dotOpacities = [dot0, dot1, dot2];
  const dotWidths = [dot0w, dot1w, dot2w];

  /* ── Mobile: stack panels vertically ── */
  if (isMobile) {
    return (
      <div className="py-24 px-6 flex flex-col gap-24">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-10">
            01 / about
          </p>
          <PanelIntro statsRef={statsRef} inView={inView} />
        </div>
        <div className="hairline-t pt-16">
          <PanelPhilosophy />
        </div>
        <div className="hairline-t pt-16">
          <PanelBeyond />
        </div>
      </div>
    );
  }

  return (
    /* Outer — tall enough to provide scroll distance: 100vh per panel */
    <div ref={trackRef} style={{ height: `${PANELS.length * 100 + 150}vh` }}>
      {/* Sticky viewport — use dvh so mobile browser chrome doesn't cause jumps */}
      <div className="sticky top-0 overflow-hidden" style={{ height: '100dvh' }}>
        {/* Section label + progress dots */}
        <div className="absolute top-8 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          <SectionReveal>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
              01 / about
            </p>
          </SectionReveal>

          <div className="flex items-center gap-2">
            {PANELS.map((_, i) => (
              <motion.div
                key={i}
                style={{
                  opacity: dotOpacities[i],
                  width: dotWidths[i],
                  height: 6,
                  borderRadius: 9999,
                  backgroundColor: 'rgb(var(--fg))',
                }}
              />
            ))}
          </div>
        </div>

        {/* Sliding track */}
        <motion.div
          style={{ x }}
          className="flex h-full"
        >
          {/* Panel 1 */}
          <div className="flex-shrink-0 w-screen h-full flex items-center">
            <div className="mx-auto max-w-6xl px-6 w-full pt-20 pb-10">
              <PanelIntro statsRef={statsRef} inView={inView} />
            </div>
          </div>

          {/* Panel 2 */}
          <div className="flex-shrink-0 w-screen h-full flex items-center">
            <div className="mx-auto max-w-6xl px-6 w-full pt-20 pb-10">
              <PanelPhilosophy />
            </div>
          </div>

          {/* Panel 3 */}
          <div className="flex-shrink-0 w-screen h-full flex items-center">
            <div className="mx-auto max-w-6xl px-6 w-full pt-20 pb-10">
              <PanelBeyond />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function About() {
  const statsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(statsRef, { once: true, amount: 0.4 });

  return (
    <section id="about" className="hairline-b">
      <HorizontalAbout statsRef={statsRef} inView={inView} />
    </section>
  );
}
