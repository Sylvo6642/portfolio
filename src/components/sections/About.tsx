import { easeInOut, easeOut, motion, useScroll, useTransform, useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { useRef, useCallback, useState, useEffect, type MouseEvent, type ReactNode } from 'react';
import { SectionReveal } from '../shared/SectionReveal';
import { StepRevealText, useScrollLinked, useRevealProgress, useRevealStyle, type Segment } from '../shared/ScrollReveal';
import { useMobileLayout } from '../../hooks/useMobileLayout';

const STATS = [
  { value: 3, label: 'Years in production', note: 'Started in cybersecurity, wandered into full-stack, stayed' },
  { value: 400, label: 'APIs built', note: 'Inventory, billing, orders: the ERP stuff nobody tweets about' },
  { value: 10, label: 'Apps shipped', note: 'Client ERPs, plus side projects like Clausify' },
  { value: 5, label: 'LLM providers', note: 'Tried them all. Each one gets a schema and a backup plan' },
];

// The pinned scroll, in stages: the first slide writes itself in (see HorizontalAbout), then
// fades out while the second fades in over it and writes itself in the same way. Each later
// slide then moves in sideways, starts writing itself in as it arrives, and holds still a
// little longer once it's done, for reading. Positions are in screen heights scrolled since pinning.
const SCROLL_VH = 8.5;
const at = (vh: number) => vh / SCROLL_VH;
const FADE: [number, number] = [at(1.2), at(1.6)];
const TRAVEL_REVEAL: [number, number] = [at(1.6), at(3.4)];
// [move starts, move ends] for slides 3, 4 and 5: 0.5 screens of writing in after each move,
// then 0.4 of reading before the next
const MOVES: [number, number][] = [[at(3.7), at(4.4)], [at(5.3), at(6.0)], [at(6.9), at(7.6)]];
// Writing in starts most of the way through the move and ends half a screen after it
const revealOf = ([from, to]: [number, number]): [number, number] => [from + (to - from) * 0.6, to + at(0.5)];

const PANELS = [
  { id: 'intro' },
  { id: 'travel' },
  { id: 'stats' },
  { id: 'philosophy' },
  { id: 'beyond' },
];

type Photo = { src: string; alt: string; badge: string };

const WORK_PHOTO: Photo = { src: '/kevin.jpg', alt: 'Kevin Robin', badge: 'Full-Stack Dev' };
const TRAVEL_PHOTO: Photo = { src: '/kevin-snow.jpg', alt: 'Kevin Robin in ski goggles on a snowy mountain trail', badge: 'Off the grid' };

function TiltPhoto({ photo }: { photo: Photo }) {
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
      style={{ zIndex: 2, rotateX: rotX, rotateY: rotY, transformPerspective: 800 }}
      className="relative w-full photo-float"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="overflow-hidden" style={{ aspectRatio: '3/4' }}>
        <motion.img
          src={photo.src}
          alt={photo.alt}
          className="w-full h-full object-cover object-top"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgb(var(--bg) / 0.35) 0%, transparent 45%)',
          }}
        />
      </div>
      <motion.div
        className="absolute -bottom-4 -right-4 font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 hairline"
        style={{ background: 'rgb(var(--bg) / 0.85)', color: 'rgb(var(--accent))' }}
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        {photo.badge}
      </motion.div>
    </motion.div>
  );
}

function PhotoFrame({ photo }: { photo: Photo }) {
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
      <TiltPhoto photo={photo} />
    </div>
  );
}

/* ─── Panel 1: Intro ─── */
// Revealed by scrolling (see HorizontalAbout): the heading writes itself word by word,
// then the tagline and story fade in; it never reverses
function PanelIntro({ progress }: { progress: MotionValue<number> }) {
  const photoStyle = useRevealStyle(progress, 0, 0.4, { x: 40 });
  const taglineStyle = useRevealStyle(progress, 0.45, 0.65, { y: 12 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 items-center md:h-full">
      <motion.div style={photoStyle} className="max-w-[150px] md:max-w-sm mx-auto md:mx-0 w-full">
        <PhotoFrame photo={WORK_PHOTO} />
      </motion.div>
      <div className="flex flex-col">
        <h2 className="display-type text-2xl md:text-4xl lg:text-5xl leading-[1.02]">
          <StepRevealText
            progress={progress}
            range={[0.05, 0.5]}
            segments={['Half ', { text: 'security nerd', className: 'stroke-text' }, ', half ', { text: 'AI tinkerer', className: 'stroke-text' }, '.']}
          />
        </h2>
        <motion.p style={taglineStyle} className="mt-3 md:mt-4 font-mono text-[13px] md:text-sm text-fg/45 tracking-wide">
          Quiet. Notices a lot. Remembers what you said three conversations ago.
        </motion.p>
        <p className="mt-4 md:mt-6 text-[15px] md:text-lg text-fg/75 leading-relaxed">
          <StepRevealText
            progress={progress}
            range={[0.55, 1]}
            segments={[
              'Based in Kozhikode, Kerala. Came up through cybersecurity, now full-stack at ',
              { text: 'Indeeya® (Lidex Tech)', className: 'text-fg font-medium' },
              " on Django, Angular and MongoDB. I build AI stuff and anything else I find interesting: RAG pipelines, multi-agent systems, full-stack apps, and generally anything that looks shiny at 2AM :) Every project I ship somehow ends up with encryption in it. Old security habits die hard.",
            ]}
          />
        </p>
      </div>
    </div>
  );
}

/* ─── Panel 2: Travel ─── */
// Fades in over the first slide and writes itself in the same way (see HorizontalAbout)
function PanelTravel({ progress }: { progress: MotionValue<number> }) {
  const photoStyle = useRevealStyle(progress, 0, 0.4, { x: 40 });
  const taglineStyle = useRevealStyle(progress, 0.45, 0.65, { y: 12 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 items-center md:h-full">
      <motion.div style={photoStyle} className="max-w-[150px] md:max-w-sm mx-auto md:mx-0 md:ml-auto w-full md:order-2">
        <PhotoFrame photo={TRAVEL_PHOTO} />
      </motion.div>
      <div className="flex flex-col md:order-1">
        <h2 className="display-type text-2xl md:text-4xl lg:text-5xl leading-[1.02]">
          <StepRevealText
            progress={progress}
            range={[0.05, 0.5]}
            segments={['Based in ', { text: 'Kerala', className: 'stroke-text' }, ', usually ', { text: 'somewhere else', className: 'stroke-text' }, '.']}
          />
        </h2>
        <motion.p style={taglineStyle} className="mt-3 md:mt-4 font-mono text-[13px] md:text-sm text-fg/45 tracking-wide">
          Currently planning the next trip. Again.
        </motion.p>
        <p className="mt-4 md:mt-6 text-[15px] md:text-lg text-fg/75 leading-relaxed">
          <StepRevealText
            progress={progress}
            range={[0.55, 1]}
            segments={[
              "Home is Kozhikode, Kerala, but I'm happiest somewhere I've never been: snowy trails, streets I can't find my way around, food I can't pronounce yet. Getting a little lost is how I reset, and weirdly, it's also how I end up fixing the bug I was stuck on. I come back with fresh eyes and a camera roll nobody asked to see.",
            ]}
          />
        </p>
      </div>
    </div>
  );
}

/* ─── Panels 3–5 share the first two slides' layout: a written-in heading and mono tagline
   on the left, the slide's content on the right ─── */
function SlideHeading({ progress, kicker, heading, tagline }: { progress: MotionValue<number>; kicker: string; heading: Segment[]; tagline: string }) {
  const kickerStyle = useRevealStyle(progress, 0, 0.15, { y: 8 });
  const taglineStyle = useRevealStyle(progress, 0.4, 0.6, { y: 12 });
  return (
    <div className="flex flex-col">
      <motion.p style={kickerStyle} className="font-mono text-xs tracking-[0.2em] uppercase text-accent mb-4 md:mb-6">
        {kicker}
      </motion.p>
      <h3 className="display-type text-2xl md:text-4xl lg:text-5xl leading-[1.02]">
        <StepRevealText progress={progress} range={[0.05, 0.45]} segments={heading} />
      </h3>
      <motion.p style={taglineStyle} className="mt-3 md:mt-4 font-mono text-[13px] md:text-sm text-fg/45 tracking-wide">
        {tagline}
      </motion.p>
    </div>
  );
}

/** One row of the slide's right-hand column, fading in over its own slice of the reveal */
function SlideRow({ progress, index, count, children }: { progress: MotionValue<number>; index: number; count: number; children: ReactNode }) {
  const from = 0.4 + (index / count) * 0.45;
  const style = useRevealStyle(progress, from, from + 0.2, { x: 24 });
  return (
    <motion.div style={style} className={`py-4 md:py-5 ${index > 0 ? 'hairline-t' : ''}`}>
      {children}
    </motion.div>
  );
}

/* ─── Panel 3: Stats ─── */
function StatNumber({ value, progress, from }: { value: number; progress: MotionValue<number>; from: number }) {
  // Counts up as the row writes in, easing out so the last digits settle slowly
  const count = useTransform(progress, [from, Math.min(1, from + 0.35)], [0, value], { ease: easeOut });
  const text = useTransform(count, (v) => String(Math.round(v)));
  return (
    <span className="display-type text-5xl md:text-6xl lg:text-7xl leading-none tabular-nums">
      <motion.span>{text}</motion.span>
      <span className="text-accent">+</span>
    </span>
  );
}

function PanelStats({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 items-center md:h-full">
      <SlideHeading
        progress={progress}
        kicker="By the numbers"
        heading={['The ', { text: 'receipts', className: 'stroke-text' }, ' from three years of ', { text: 'shipping', className: 'stroke-text' }, '.']}
        tagline="Counted, not guessed. Tabs open: still ∞."
      />
      <div className="flex flex-col">
        {STATS.map((s, i) => (
          <SlideRow key={s.label} progress={progress} index={i} count={STATS.length}>
            <div className="grid grid-cols-[6.5rem_1fr] md:grid-cols-[9.5rem_1fr] lg:grid-cols-[11rem_1fr] items-center gap-4 md:gap-6">
              <StatNumber value={s.value} progress={progress} from={0.4 + (i / STATS.length) * 0.45} />
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted">{s.label}</span>
                <span className="text-[15px] md:text-base text-fg/75 leading-snug">{s.note}</span>
              </div>
            </div>
          </SlideRow>
        ))}
      </div>
    </div>
  );
}

/* ─── Panel 4: How I work ─── */
const PRINCIPLES = [
  {
    title: 'Correct at the edges',
    body: "The happy path is easy. I'm the one poking at the weird stuff: the radio button that quietly loaded the wrong record, the migration that lost data and told no one.",
  },
  {
    title: 'AI that earns its place',
    body: 'An LLM call is just another dependency: it gets a schema, a fallback, a budget and a sanity check. And if plain old code does the job better, plain old code wins.',
  },
  {
    title: 'Real problems over toy ones',
    body: "I'd rather fix the production bug everyone's scared of than build another to-do app in this week's framework. The boring stuff is where you actually learn.",
  },
];

function PanelPhilosophy({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 items-center md:h-full">
      <SlideHeading
        progress={progress}
        kicker="How I work"
        heading={["If I wouldn't ", { text: 'use it', className: 'stroke-text' }, ", I don't ", { text: 'ship it', className: 'stroke-text' }, '.']}
        tagline="Note to self: never count-then-insert. Use atomic counters."
      />
      <div className="flex flex-col">
        {PRINCIPLES.map((p, i) => (
          <SlideRow key={p.title} progress={progress} index={i} count={PRINCIPLES.length}>
            <div className="grid grid-cols-[2.25rem_1fr] md:grid-cols-[3rem_1fr] gap-2">
              <span className="font-mono text-xs md:text-sm text-accent pt-1.5 md:pt-2">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <span className="display-type text-xl md:text-2xl leading-tight">{p.title}</span>
                <span className="text-[15px] md:text-base text-fg/70 leading-relaxed">{p.body}</span>
              </div>
            </div>
          </SlideRow>
        ))}
      </div>
    </div>
  );
}

/* ─── Panel 5: Right now ─── */
const NOW = [
  { kind: 'Building', label: 'Clausify', meta: 'Gemini · structured outputs · React' },
  { kind: 'Learning', label: 'RAG & AI agents', meta: 'Weaviate · Pinecone · tool calling' },
  { kind: 'Shipping', label: 'Indeeya ERP modules', meta: 'inventory · billing · orders' },
  { kind: 'Reading', label: 'Sci-fi, mostly', meta: 'paperback over kindle' },
];

function PanelBeyond({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-20 items-center md:h-full">
      <SlideHeading
        progress={progress}
        kicker="Right now"
        heading={["What's eating my ", { text: 'free time', className: 'stroke-text' }, ' right now.']}
        tagline="Off-keyboard: gym, swimming, long walks, gaming, and cooking (keyword: attempting)."
      />
      <div className="flex flex-col">
        {NOW.map((item, i) => (
          <SlideRow key={item.kind} progress={progress} index={i} count={NOW.length}>
            <div className="grid grid-cols-[5.5rem_1fr] md:grid-cols-[7rem_1fr] items-baseline gap-2">
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-accent">{item.kind}</span>
              <div className="flex flex-col gap-1">
                <span className="display-type text-2xl md:text-3xl leading-tight">{item.label}</span>
                <span className="font-mono text-[11px] md:text-xs text-muted tracking-wide">{item.meta}</span>
              </div>
            </div>
          </SlideRow>
        ))}
      </div>
    </div>
  );
}

/* ─── Progress dot — lights up while its slide is the one on screen ─── */
function ProgressDot({ position, index }: { position: MotionValue<number>; index: number }) {
  const opacity = useTransform(position, [index - 1, index, index + 1], [0.35, 1, 0.35]);
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

/* ─── Phones: the slides stack in normal flow, each writing itself in as it rises up the screen ─── */
function StackedPanel({ Panel }: { Panel: (props: { progress: MotionValue<number> }) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useRevealProgress(ref, ['start 85%', 'end 60%']);
  return (
    <div ref={ref}>
      <Panel progress={progress} />
    </div>
  );
}

/* ─── Horizontal scroll container ─── */
function HorizontalAbout() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));
  const isMobile = useMobileLayout();

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });
  // The first slide reveals from when its heading is well into view (section top 20% down)
  // until a screen into the pinned stretch, before it fades out
  const introProgress = useRevealProgress(trackRef, ['start 20%', 'start -100%']);
  // The travel slide writes itself in once the first has faded out
  const travelProgress = useScrollLinked(useTransform(scrollYProgress, TRAVEL_REVEAL, [0, 1]));
  // The sideways slides write themselves in as they arrive
  const statsProgress = useScrollLinked(useTransform(scrollYProgress, revealOf(MOVES[0]), [0, 1]));
  const workProgress = useScrollLinked(useTransform(scrollYProgress, revealOf(MOVES[1]), [0, 1]));
  const nowProgress = useScrollLinked(useTransform(scrollYProgress, revealOf(MOVES[2]), [0, 1]));

  // The first two slides share a screen and cross-fade; like the writing, this follows the scroll both ways,
  // so scrolling back up brings the first slide back
  const introOpacity = useTransform(scrollYProgress, FADE, [1, 0]);
  const introY = useTransform(scrollYProgress, FADE, [0, -24]);
  const travelOpacity = useTransform(scrollYProgress, FADE, [0, 1]);
  // Only the visible one takes the mouse (the photo tilts on hover)
  const introPointer = useTransform(introOpacity, (v) => (v > 0.5 ? 'auto' : 'none'));
  const travelPointer = useTransform(travelOpacity, (v) => (v > 0.5 ? 'auto' : 'none'));

  // Which slide is on screen, 0 to 4, for the progress dots
  const position = useTransform(scrollYProgress, [FADE[0], FADE[1], ...MOVES.flat()], [0, 1, 1, 2, 2, 3, 3, 4]);

  // Follows scroll directly: Lenis already smooths the page, and a spring on top of it
  // made the slides trail behind the scroll. Each move eases in and out, and the track
  // holds still between moves while the slide on screen writes itself in.
  const x = useTransform(scrollYProgress, MOVES.flat(), [0, -vw, -vw, -2 * vw, -2 * vw, -3 * vw], { ease: easeInOut });

  // Native document flow avoids resizing/scaling an entire sticky track as
  // mobile browser chrome expands and collapses during a swipe.
  if (isMobile) {
    return (
      <div ref={trackRef} className="about-mobile mx-auto max-w-6xl px-6 pt-28 pb-16">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-muted mb-10">(02) — About</p>
        <div className="space-y-20">
          {[PanelIntro, PanelTravel, PanelStats, PanelPhilosophy, PanelBeyond].map((Panel, i) => (
            <StackedPanel key={PANELS[i].id} Panel={Panel} />
          ))}
        </div>
      </div>
    );
  }

  const slide = 'mx-auto max-w-6xl px-6 w-full h-full pt-32 pb-6 md:pt-20 md:pb-10 grid items-center';
  return (
    /* Outer — one screen for the pinned view plus the scroll distance of all the stages */
    <div ref={trackRef} style={{ height: `${(SCROLL_VH + 1) * 100}vh` }}>
      {/* Sticky viewport — use dvh so mobile browser chrome doesn't cause jumps */}
      <div className="sticky top-0 overflow-hidden" style={{ height: '100dvh' }}>
        {/* Section label + progress dots, kept left: the floating menu button owns the top-right corner */}
        <div className="absolute top-20 left-6 z-20 flex items-center gap-6 pointer-events-none">
          <SectionReveal>
            <p className="font-mono text-xs tracking-[0.25em] uppercase text-muted">
              (02) — About
            </p>
          </SectionReveal>

          <div className="flex items-center gap-2">
            {PANELS.map((_, i) => (
              <ProgressDot key={i} position={position} index={i} />
            ))}
          </div>
        </div>

        {/* Sliding track */}
        {/* Own GPU layer, so moving the four-screen-wide track doesn't repaint it every frame */}
        <motion.div
          style={{ x, willChange: 'transform' }}
          className="flex h-full"
        >
          {/* Panels 1 and 2 — Intro, then Travel, stacked on one screen */}
          <div className="flex-shrink-0 w-screen h-full">
            <div className={slide}>
              <motion.div style={{ opacity: introOpacity, y: introY, pointerEvents: introPointer }} className="col-start-1 row-start-1">
                <PanelIntro progress={introProgress} />
              </motion.div>
              <motion.div style={{ opacity: travelOpacity, pointerEvents: travelPointer }} className="col-start-1 row-start-1">
                <PanelTravel progress={travelProgress} />
              </motion.div>
            </div>
          </div>

          {/* Panel 3 — Stats */}
          <div className="flex-shrink-0 w-screen h-full">
            <div className={slide}><PanelStats progress={statsProgress} /></div>
          </div>

          {/* Panel 4 — How I work */}
          <div className="flex-shrink-0 w-screen h-full">
            <div className={slide}><PanelPhilosophy progress={workProgress} /></div>
          </div>

          {/* Panel 5 — Right now */}
          <div className="flex-shrink-0 w-screen h-full">
            <div className={slide}><PanelBeyond progress={nowProgress} /></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="hairline-b bg-bg">
      <HorizontalAbout />
    </section>
  );
}
