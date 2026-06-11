import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { useRef, useCallback, useState, useEffect, type RefObject, type MouseEvent, type ReactNode } from 'react';
import { SectionReveal } from '../shared/SectionReveal';
import { useCountUp } from '../../hooks/useCountUp';

const STATS = [
  { value: 3, suffix: '+', label: 'Years in Production' },
  { value: 147, suffix: '+', label: 'APIs Built' },
  { value: 113, suffix: '+', label: 'Bugs Squashed' },
  { value: 5, suffix: '', label: 'Encrypted Apps Shipped' },
  { value: 5, suffix: '+', label: 'Tech Stacks' },
  { value: null, suffix: '∞', label: 'Tabs Open' },
];

const PANELS = [
  { id: 'intro' },
  { id: 'stats' },
  { id: 'philosophy' },
  { id: 'beyond' },
];

function Stat({ value, suffix, label, start }: { value: number | null; suffix: string; label: string; start: boolean }) {
  const v = useCountUp(value ?? 0, 2200, start);
  return (
    <div className="flex flex-col items-center text-center">
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

function TiltPhoto() {
  const ref = useRef<HTMLDivElement>(null);
  // Observe the unclipped wrapper — the clipped frame itself reports zero
  // visible area while hidden, so it can never trigger its own reveal.
  const revealed = useInView(ref, { once: true, amount: 0.25 });
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
      style={{ zIndex: 2, rotateX: rotX, rotateY: rotY, transformPerspective: 800 }}
      className="relative w-full photo-float"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Clip-path wipe: frame opens bottom-up while the image settles from a zoom */}
      <motion.div
        className="overflow-hidden"
        style={{ aspectRatio: '3/4' }}
        initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
        animate={revealed ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.img
          src="/kevin.png"
          alt="Kevin Robin"
          className="w-full h-full object-cover object-top"
          initial={{ scale: 1.25 }}
          animate={revealed ? { scale: 1 } : undefined}
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgb(var(--bg) / 0.35) 0%, transparent 45%)',
          }}
        />
      </motion.div>
      <motion.div
        className="absolute -bottom-4 -right-4 font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 hairline backdrop-blur-sm"
        style={{ background: 'rgb(var(--bg) / 0.85)', color: 'rgb(var(--accent))' }}
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Full-Stack Dev
      </motion.div>
    </motion.div>
  );
}

function PhotoFrame() {
  return (
    <div className="relative flex items-center justify-center">
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
      <TiltPhoto />
    </div>
  );
}

/* ─── Panel 1: Intro ─── */
function PanelIntro() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 items-center md:h-full">
      <div className="max-w-[150px] md:max-w-sm mx-auto md:mx-0 w-full">
        <PhotoFrame />
      </div>
      <div className="flex flex-col">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="display-type text-2xl md:text-4xl lg:text-5xl leading-[1.02]"
        >
          A <span className="stroke-text">security brain</span> and a{' '}
          <span className="stroke-text">motion brain</span>, in the same developer.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 md:mt-4 font-mono text-[13px] md:text-sm text-fg/45 tracking-wide"
        >
          Quiet. Notices a lot. Remembers what you said three conversations ago.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 md:mt-6 text-[15px] md:text-lg text-fg/75 leading-relaxed"
        >
          Based in Kozhikode, Kerala. Came up through cybersecurity, now full-stack at{' '}
          <span className="text-fg font-medium">Indeeya® (Lidex Tech)</span> 
          Django, Angular, MongoDB. Currently moving into React, Node, Supabase, and
          PostgreSQL. Every project I ship has encryption in it; I don't think that's a
          coincidence.
        </motion.p>
      </div>
    </div>
  );
}

/* ─── Panel: Stats ─── */
function PanelStats({ statsRef, inView }: { statsRef: RefObject<HTMLDivElement>; inView: boolean }) {
  return (
    <div className="flex flex-col justify-center items-center h-full max-w-3xl mx-auto w-full">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="font-mono text-xs tracking-[0.2em] uppercase text-accent mb-10 text-center"
      >
        By the numbers
      </motion.p>
      <motion.div
        ref={statsRef}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 md:gap-x-16 gap-y-10 content-center justify-items-center w-full"
      >
        {STATS.map((s) => (
          <Stat key={s.label} {...s} start={inView} />
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Panel 2: Philosophy ─── */
function PanelPhilosophy() {
  const principles = [
    {
      icon: '◈',
      title: 'Correct at the edges',
      body: 'The happy path is the easy part. I spend my time on the silent failures the radio button that loaded the wrong record without an error, the count-then-insert race condition, the migration nobody noticed was lossy.',
    },
    {
      icon: '◎',
      title: 'Motion as craft',
      body: 'How a thing moves is part of what it is. Not paths and easing curves applied after the fact physics, intent, restraint. If it can drift instead of slide, it should drift.',
    },
    {
      icon: '◐',
      title: 'Real problems over toy ones',
      body: "I'd rather fix one production bug that nobody wants to touch than rebuild a to-do app in a new framework. The unglamorous stuff is where you actually learn the stack.",
    },
  ];

  return (
    <div className="flex flex-col justify-center md:h-full max-w-3xl mx-auto w-full">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="font-mono text-xs tracking-[0.2em] uppercase text-accent mb-4 md:mb-6"
      >
        How I work
      </motion.p>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="display-type text-2xl md:text-4xl leading-[1.02] mb-6 md:mb-12"
      >
        I build software the way I'd want to{' '}
        <span className="stroke-text">use it</span> correct, considered, and honest.
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8 mb-6 md:mb-14">
        {principles.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="hairline rounded-xl p-4 md:p-6 flex flex-col gap-2 md:gap-3 hover:bg-fg/[0.03] transition-colors"
          >
            <span className="text-accent text-xl md:text-2xl leading-none">{p.icon}</span>
            <span className="font-semibold text-sm md:text-base">{p.title}</span>
            <span className="text-[13px] md:text-sm text-fg/65 leading-relaxed">{p.body}</span>
          </motion.div>
        ))}
      </div>

      <motion.blockquote
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative pl-4 md:pl-6"
        style={{ borderLeft: '2px solid rgb(var(--accent) / 0.5)' }}
      >
        <p className="text-base md:text-xl text-fg/70 italic leading-relaxed">
          "Don't generate sequential IDs by counting existing records. Use atomic counters.
          The count-then-insert pattern is always a race condition waiting to happen."
        </p>
        <footer className="mt-2 md:mt-3 font-mono text-[10px] md:text-xs tracking-[0.15em] uppercase text-muted">
          — A note to myself, after a long Monday
        </footer>
      </motion.blockquote>
    </div>
  );
}

/* ─── Panel 3: Beyond Code ─── */
function PanelBeyond() {
  const offKeyboard = [
    {
      group: 'Body',
      items: [
        { label: 'Gym', icon: '◈' },
        { label: 'Swimming', icon: '◎' },
        { label: 'Long walks', icon: '◌' },
      ],
    },
    {
      group: 'Mind',
      items: [
        { label: 'Cybersecurity rabbit holes', icon: '◉' },
        { label: 'UI/UX teardowns', icon: '✧' },
        { label: 'Cooking', icon: '♪', note: 'keyword: attempting' },
      ],
    },
    {
      group: 'On the go',
      items: [
        { label: 'Travel', icon: '✦', note: 'planned months out' },
        { label: 'Gaming', icon: '◐' },
      ],
    },
  ];

  const now = [
    { kind: 'building', label: 'Clausify', meta: 'React · Vite · Framer Motion' },
    { kind: 'learning', label: 'Docker + AWS', meta: 'getting serious about infra' },
    { kind: 'reading', label: 'Sci-fi, mostly', meta: 'paperback over kindle' },
    { kind: 'shipping', label: 'Indeeya ERP modules', meta: 'inventory · billing · orders' },
  ];


  return (
    <div className="flex flex-col justify-center md:h-full max-w-3xl mx-auto w-full">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="font-mono text-xs tracking-[0.2em] uppercase text-accent mb-4 md:mb-6"
      >
        Beyond the code
      </motion.p>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="display-type text-2xl md:text-4xl leading-[1.02] mb-6 md:mb-10"
      >
        Lost in airports,{' '}
        <span className="stroke-text">found in terminals.</span>
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10">
        {/* Off-keyboard — grouped chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-3 flex flex-col gap-3 md:gap-5"
        >
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted">
            Off-keyboard
          </p>
          {offKeyboard.map((g, gi) => (
            <div key={g.group} className="flex flex-col gap-1.5 md:gap-2.5">
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-fg/35">
                {g.group}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((item, i) => (
                  <motion.span
                    key={item.label}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.15 + gi * 0.08 + i * 0.04 }}
                    className="inline-flex items-baseline gap-1.5 hairline rounded-full px-2.5 py-1 md:px-3 md:py-1.5 text-[13px] md:text-sm hover:bg-fg/5 transition-colors"
                  >
                    <span className="text-accent text-xs">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.note && (
                      <span className="font-mono text-[10px] text-fg/40 tracking-wide ml-0.5">
                        {item.note}
                      </span>
                    )}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Now — live status card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-2 flex flex-col gap-3 md:gap-6"
        >
          <div className="hairline rounded-xl p-4 md:p-5 bg-fg/[0.02] flex flex-col gap-3 md:gap-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted">
                Now
              </p>
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {now.map((item, i) => (
                <motion.div
                  key={item.kind}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.3 + i * 0.07 }}
                  className="flex flex-col gap-0.5"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-accent w-[58px]">
                      {item.kind}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted tracking-wide pl-[66px]">
                    {item.meta}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>

      {/* Signature line */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="mt-6 pt-4 md:mt-10 md:pt-6 hairline-t text-[13px] md:text-sm text-fg/55 italic leading-relaxed max-w-2xl"
      >
        I'm quiet, that's just me. I don't say much, but I notice a lot and I'm always
        paying attention. Once I'm comfortable, though, you'll wish I'd shut up.
      </motion.p>
    </div>
  );
}

/* ─── Progress dot — derives its own active range from its index ─── */
function ProgressDot({ progress, index, count }: { progress: MotionValue<number>; index: number; count: number }) {
  // Map overall scroll progress (within the 0.06–0.94 travel window) to this dot's band.
  const start = 0.06;
  const end = 0.94;
  const span = (end - start) / count;
  const lo = start + index * span;
  const hi = lo + span;
  const mid = (lo + hi) / 2;

  const opacity = useTransform(
    progress,
    [lo - span * 0.5, mid, hi + span * 0.5],
    [0.35, 1, 0.35],
  );
  const width = useTransform(opacity, [0.35, 1], [6, 20]);

  return (
    <motion.div
      style={{
        opacity,
        width,
        height: 6,
        borderRadius: 9999,
        backgroundColor: 'rgb(var(--fg))',
      }}
    />
  );
}

/* ─── Fit-to-viewport wrapper ───
   On phones, measures content vs. available height and scales it down so the
   whole panel always fits one screen — no inner scrolling, on any device.
   On md+ it's a no-op (content renders at full size). */
function FitPanel({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!enabled) {
      setScale(1);
      return;
    }
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const measure = () => {
      const avail = outer.clientHeight;
      // Natural (unscaled) content height.
      const natural = inner.scrollHeight;
      if (natural <= 0 || avail <= 0) return;
      // Leave a little breathing room top/bottom.
      const next = Math.min(1, (avail - 8) / natural);
      setScale(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    ro.observe(inner);
    window.addEventListener('orientationchange', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', measure);
    };
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div ref={outerRef} className="h-full w-full flex items-stretch justify-center overflow-hidden">
      <div
        ref={innerRef}
        style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        className="w-full"
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Horizontal scroll container ─── */
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

  const springConfig = isMobile
    ? { stiffness: 500, damping: 38, restDelta: 0.001 }
    : { stiffness: 280, damping: 32, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);
  const totalShift = -(PANELS.length - 1) * vw;
  const x = useTransform(smoothProgress, [0.06, 0.94], [0, totalShift]);

  return (
    /* Outer — tall enough to provide scroll distance: 100vh per panel */
    <div ref={trackRef} style={{ height: `${PANELS.length * 100 + 150}vh` }}>
      {/* Sticky viewport — use dvh so mobile browser chrome doesn't cause jumps */}
      <div className="sticky top-0 overflow-hidden" style={{ height: '100dvh' }}>
        {/* Section label + progress dots */}
        <div className="absolute top-20 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          <SectionReveal>
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-muted">
              (01) — About
            </p>
          </SectionReveal>

          <div className="flex items-center gap-2">
            {PANELS.map((_, i) => (
              <ProgressDot key={i} progress={smoothProgress} index={i} count={PANELS.length} />
            ))}
          </div>
        </div>

        {/* Sliding track */}
        <motion.div
          style={{ x }}
          className="flex h-full"
        >
          {/* Panel 1 — Intro */}
          <div className="flex-shrink-0 w-screen h-full">
            <div className="mx-auto max-w-6xl px-6 w-full h-full pt-32 pb-6 md:pt-20 md:pb-10 flex flex-col justify-center">
              <FitPanel enabled={isMobile}>
                <PanelIntro />
              </FitPanel>
            </div>
          </div>

          {/* Panel 2 — Stats */}
          <div className="flex-shrink-0 w-screen h-full">
            <div className="mx-auto max-w-6xl px-6 w-full h-full pt-32 pb-6 md:pt-20 md:pb-10 flex flex-col justify-center">
              <FitPanel enabled={isMobile}>
                <PanelStats statsRef={statsRef} inView={inView} />
              </FitPanel>
            </div>
          </div>

          {/* Panel 3 — Philosophy */}
          <div className="flex-shrink-0 w-screen h-full">
            <div className="mx-auto max-w-6xl px-6 w-full h-full pt-32 pb-6 md:pt-20 md:pb-10 flex flex-col justify-center">
              <FitPanel enabled={isMobile}>
                <PanelPhilosophy />
              </FitPanel>
            </div>
          </div>

          {/* Panel 4 — Beyond */}
          <div className="flex-shrink-0 w-screen h-full">
            <div className="mx-auto max-w-6xl px-6 w-full h-full pt-32 pb-6 md:pt-20 md:pb-10 flex flex-col justify-center">
              <FitPanel enabled={isMobile}>
                <PanelBeyond />
              </FitPanel>
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
