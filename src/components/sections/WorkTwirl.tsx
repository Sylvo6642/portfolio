import { useInView, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { StepRevealText, useScrollLinked, type Segment } from '../shared/ScrollReveal';
import { RagVideo } from './RagVideo';

/**
 * The bridge from the intro to the work list, after breakthroughenergy.org: the RAG film fills the
 * screen, shrinks to a card, then flies out into a cloud of project screenshots that twirls around a
 * short line of copy and spirals off screen as the project list arrives.
 * Everything runs off one scroll progress and writes transforms directly, so the 17 moving pieces
 * cost one style pass per frame instead of a React render.
 */

const LINE: Segment[] = ["Some things I've designed and built end to end, from LLM pipelines to encrypted storage."];

const FILM = '/media/rag-explainer';

type Tile = { src: string; portrait?: boolean };
const TILES: Tile[] = [
  { src: '/projects/previews/clausify.jpg' },
  { src: '/projects/tiles/skilldash-mobile.webp', portrait: true },
  { src: '/projects/tiles/voidvault-login.webp' },
  { src: '/projects/tiles/spendwise-hero.webp' },
  { src: '/projects/tiles/clausify-how.webp' },
  { src: '/media/skilldash-poster.jpg' },
  { src: '/projects/tiles/clausify-mobile.webp', portrait: true },
  { src: '/projects/previews/voidvault.jpg' },
  { src: '/projects/tiles/skilldash-cats.webp' },
  { src: '/projects/previews/spendwise.jpg' },
  { src: '/projects/tiles/voidvault-mobile.webp', portrait: true },
  { src: '/projects/tiles/clausify-mid.webp' },
  { src: '/projects/previews/skilldash.jpg' },
  { src: '/media/void-vault-poster.jpg' },
  { src: '/projects/tiles/skilldash-hero.webp' },
  { src: '/projects/tiles/clausify-hero.webp' },
];
// Phones get the first ten: more than that crowds a narrow screen
const MOBILE_TILES = 10;

// Deterministic scatter: evenly spaced angles nudged off the grid, three rings, varied size and pace
const ORBITS = TILES.map((_, i) => {
  const jitter = Math.sin(i * 12.9898) * 0.5; // -0.5..0.5, stable between renders
  return {
    angle: (i / TILES.length) * Math.PI * 2 + jitter * 0.35,
    ring: [0.8, 1.0, 0.9][i % 3] + jitter * 0.08,
    size: [1, 0.78, 1.18, 0.9][i % 4],
    pace: 0.8 + ((i * 7) % 5) * 0.1, // inner tiles lap the outer ones a little, for depth
  };
});
// Where the film settles in the cloud: upper right, just off the copy
const FILM_SLOT = { angle: -Math.PI * 0.2, ring: 0.86 };

// Timeline, in 0-1 of the pinned scroll
const T = {
  shrink: [0.1, 0.3],
  emerge: [0.26, 0.46],
  filmOut: [0.3, 0.46],
  // The tint starts with the shrink: the film's own paper background matches the page, so
  // without it the card's edges would vanish while it shrinks
  flood: [0.1, 0.24],
  words: [0.46, 0.62],
  // Tiles are still drifting off the edges as the stage unpins, so the list never follows an empty screen
  exit: [0.8, 1],
  unflood: [0.84, 1],
} as const;
// Screens of scroll the pinned stage holds for
const TRACK_VH = 5;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const span = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function WorkTwirl() {
  return useReducedMotion() ? <StillWork /> : <TwirlingWork />;
}

/** Reduce Motion: the film as a card and the line beneath it, nothing moving */
function StillWork() {
  return (
    <section aria-label="Selected work" className="relative bg-bg py-20 sm:py-28">
      <div className="mx-auto max-w-[1000px] px-5 sm:px-8">
        <RagVideo />
        <p className="mt-10 display-type text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.2] tracking-[-0.025em] text-center">
          {LINE.join('')}
        </p>
      </div>
    </section>
  );
}

function TwirlingWork() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const floodRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const filmInnerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastRadius = useRef('');
  const copyRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const size = useRef({ w: 0, h: 0, mobile: false, tile: 0, cardW: 0, cardH: 0 });

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const progress = useScrollLinked(scrollYProgress);
  const inView = useInView(trackRef, { amount: 0.05 });
  // Two screens out, so the film buffers and the screenshots decode before they're on screen,
  // instead of all at once on the frame they first appear
  const near = useInView(trackRef, { margin: '200% 0px' });

  const render = useCallback((p: number) => {
    const { w, h, mobile, tile, cardW, cardH } = size.current;
    if (!w) return;

    // Orbit radii: half the stage, a little wider than the screen on phones so tiles graze the edges
    const ax = mobile ? w * 0.56 : w * 0.46;
    const ay = mobile ? h * 0.4 : h * 0.44;
    const emerge = ease(span(p, T.emerge));
    const exit = ease(span(p, T.exit));
    // Clustered behind the film, out to the rings, then pushed out to the edges
    const spread = lerp(0.1, 1, emerge) + exit * 0.3;
    const turn = Math.max(0, p - T.emerge[0]) * Math.PI * 0.95;

    tileRefs.current.forEach((el, i) => {
      if (!el) return;
      const o = ORBITS[i];
      const a = o.angle + turn * o.pace;
      const x = Math.cos(a) * o.ring * spread * ax;
      const y = Math.sin(a) * o.ring * spread * ay;
      const s = lerp(0.35, 1, emerge);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${s})`;
      el.style.opacity = String(clamp01(emerge * 2.5));
    });

    // The film: full screen, down to a card, then out to its slot at tile size.
    // The frame keeps one fixed card size and is only scaled, so the browser never re-lays out or
    // re-scales the playing video; the video inside gets the inverse of the frame's stretch, which
    // keeps it at one even scale (cover on desktop, letterboxed on portrait phones)
    const film = filmRef.current;
    const inner = filmInnerRef.current;
    if (film && inner) {
      const shrink = ease(span(p, T.shrink));
      const out = ease(span(p, T.filmOut));
      const k = lerp(1, (tile * 1.35) / cardW, out);
      const sx = lerp(w / cardW, 1, shrink) * k;
      const sy = lerp(h / cardH, 1, shrink) * k;
      const even = mobile ? Math.min(sx, sy) : Math.max(sx, sy);
      const a = FILM_SLOT.angle + turn * 0.9;
      const fx = Math.cos(a) * FILM_SLOT.ring * out * (1 + exit * 0.3) * ax;
      const fy = Math.sin(a) * FILM_SLOT.ring * out * (1 + exit * 0.3) * ay;
      film.style.transform = `translate3d(${fx}px, ${fy}px, 0) translate(-50%, -50%) scale(${sx}, ${sy})`;
      inner.style.transform = `scale(${even / sx}, ${even / sy})`;
      // Corners grow in only while it shrinks (square at full screen), and are written only when they change
      const r = lerp(0, mobile ? 10 : 16, shrink);
      const radius = shrink >= 1 ? `${(mobile ? 10 : 16)}px` : `${(r / sx).toFixed(2)}px / ${(r / sy).toFixed(2)}px`;
      if (radius !== lastRadius.current) {
        film.style.borderRadius = radius;
        lastRadius.current = radius;
      }
    }

    if (floodRef.current) floodRef.current.style.opacity = String(ease(span(p, T.flood)) * (1 - ease(span(p, T.unflood))));
    if (copyRef.current) copyRef.current.style.opacity = String(1 - ease(span(p, [0.8, 0.9])));
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const mobile = w < 768;
      const tile = mobile ? Math.max(92, w * 0.26) : Math.min(Math.max(150, w * 0.14), 250);
      const cardW = mobile ? w * 0.84 : Math.min(w * 0.56, 760);
      const cardH = (cardW * 9) / 16;
      size.current = { w, h, mobile, tile, cardW, cardH };
      lastRadius.current = '';
      if (filmRef.current) {
        filmRef.current.style.width = `${cardW}px`;
        filmRef.current.style.height = `${cardH}px`;
      }
      tileRefs.current.forEach((el, i) => {
        if (el) el.style.width = `${tile * ORBITS[i].size * (TILES[i].portrait ? 0.62 : 1)}px`;
      });
      render(progress.get());
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [progress, render]);

  useMotionValueEvent(progress, 'change', render);

  useEffect(() => {
    if (!near) return;
    const video = videoRef.current;
    if (video && video.preload !== 'auto') {
      video.preload = 'auto';
      video.load();
    }
    tileRefs.current.forEach((el) => {
      const img = el?.querySelector('img');
      // Tiles hidden on phones stay lazy, so they're never fetched there
      if (img && !img.dataset.decoded && el!.offsetWidth > 0) {
        img.dataset.decoded = '1';
        img.loading = 'eager';
        img.decode().catch(() => {});
      }
    });
  }, [near]);

  // The film only plays while the stage is on screen
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView) video.play().catch(() => {});
    else video.pause();
  }, [inView]);

  return (
    <section aria-label="Selected work" className="relative bg-bg">
      <div ref={trackRef} style={{ height: `${(TRACK_VH + 1) * 100}vh` }}>
        <div ref={stageRef} className="sticky top-0 overflow-hidden bg-bg" style={{ height: '100dvh' }}>
          <div ref={floodRef} aria-hidden className="absolute inset-0 bg-accent-soft will-change-[opacity]" style={{ opacity: 0 }} />

          <div aria-hidden className="absolute left-1/2 top-1/2">
            {TILES.map((t, i) => (
              <div
                key={t.src}
                ref={(el) => (tileRefs.current[i] = el)}
                className={`absolute left-0 top-0 overflow-hidden rounded-md shadow-[0_18px_40px_rgb(0_0_0/0.18)] will-change-transform ${i >= MOBILE_TILES ? 'max-md:hidden' : ''}`}
                style={{ aspectRatio: t.portrait ? '1 / 1.35' : '16 / 10', opacity: 0 }}
              >
                <img src={t.src} alt="" loading="lazy" decoding="async" className="block h-full w-full object-cover" />
              </div>
            ))}

            <div ref={filmRef} className="absolute left-0 top-0 z-10 overflow-hidden bg-[#FBF8F4] shadow-[0_24px_60px_rgb(0_0_0/0.2)] will-change-transform" style={{ transform: 'translate(-50%, -50%)' }}>
              <div ref={filmInnerRef} className="h-full w-full will-change-transform">
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="metadata"
                poster={`${FILM}-poster.webp`}
                aria-hidden
                className="block h-full w-full object-cover"
              >
                <source src={`${FILM}.webm`} type="video/webm" />
                <source src={`${FILM}.mp4`} type="video/mp4" />
              </video>
              </div>
            </div>
          </div>

          <div ref={copyRef} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 will-change-[opacity]">
            <p className="display-type max-w-[19ch] text-center text-[clamp(1.6rem,3.4vw,3rem)] leading-[1.15] tracking-[-0.03em] sm:max-w-[24ch]">
              <StepRevealText segments={LINE} progress={progress} range={[...T.words]} />
            </p>
          </div>

          <p className="sr-only">
            A film of a RAG pipeline answering "What has Kevin built with LLMs?" shrinks into a cloud of screenshots
            from Clausify, Void Vault, SkillDash and SpendWise.
          </p>
        </div>
      </div>
    </section>
  );
}
