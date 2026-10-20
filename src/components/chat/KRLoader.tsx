import gsap from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { useEffect, useRef } from 'react';
import { KR_CENTER, KR_PATHS, KRLogo } from '../shared/KRLogo';

gsap.registerPlugin(MorphSVGPlugin);

const [CX, CY] = KR_CENTER;

// Arc of radius r from angle a0 to a1 (degrees, clockwise from 3 o'clock, a0 < a1).
// dir -1 draws it backwards, so each arc runs the same way as the KR stroke it came from.
function arc(a0: number, a1: number, r: number, dir: number) {
  const p = (a: number) => [CX + r * Math.cos((a * Math.PI) / 180), CY + r * Math.sin((a * Math.PI) / 180)].map((n) => n.toFixed(2)).join(' ');
  const [s, e] = dir > 0 ? [a0, a1] : [a1, a0];
  return `M${p(s)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} ${dir > 0 ? 1 : 0} ${p(e)}`;
}

// Each stroke bends into the arc nearest it, as [centre angle, direction]:
// stem → left (drawn top to bottom), arm + R → top-right, leg → bottom
const SLOTS = [[180, -1], [300, 1], [60, -1]];

/* The breathing ring, worked out fresh every frame from the time t (seconds). All three arcs move as one,
   so it stays round: each head sweeps ahead until the ring is nearly closed, then its tail catches up;
   the ring swells and thins as it closes, tightens and thickens as it opens, and turns steadily throughout */
const RING = { cycle: 1.5, crawl: 78, min: 32, spin: 100 };
const sweep = gsap.parseEase('power2.inOut');
function ring(t: number, extra = 0) {
  const p = t / RING.cycle;
  const k = Math.floor(p), f = p - k;
  const head = RING.crawl * sweep(Math.min(1, f / 0.5));
  const tail = RING.crawl * sweep(Math.max(0, (f - 0.5) / 0.5));
  const stretch = (head - tail) / RING.crawl;
  const r = 76 + 6 * stretch;
  const w = 22 - 4 * stretch;
  const shift = k * RING.crawl + RING.spin * t + extra - (RING.min + RING.crawl) / 2;
  return SLOTS.map(([c, dir]) => ({ d: arc(c + shift + tail, c + shift + head + RING.min, r, dir), w }));
}
// Starts mid-cycle, so KR closes straight into a nearly full ring
const T0 = RING.cycle * 0.5;
// Eases the ring's clock in from a standstill, so it doesn't jolt after the morph
const easeClock = (s: number) => s - 0.45 * (1 - Math.exp(-s / 0.45));

/** The KR logo that folds into a breathing ring while `loading`, then unfolds back into KR */
export function KRLoader({ loading, className }: { loading: boolean; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !loading) return;
    const spinner = svg.querySelector<SVGGElement>('[data-kr-spin]')!;
    const paths = [...svg.querySelectorAll('path')];

    // Reduced motion: a gentle pulse instead of the ring
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const pulse = gsap.to(svg, { opacity: 0.45, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      return () => {
        pulse.kill();
        gsap.to(svg, { opacity: 1, duration: 0.4 });
      };
    }

    let started: number | null = null;
    let t = T0;
    const draw = (state: ReturnType<typeof ring>) => state.forEach((s, i) => {
      paths[i].setAttribute('d', s.d);
      paths[i].style.strokeWidth = String(s.w);
    });
    const tick = () => {
      t = T0 + easeClock((performance.now() - started!) / 1000);
      draw(ring(t));
    };

    gsap.killTweensOf([...paths, spinner]);
    gsap.set(spinner, { rotation: 0, svgOrigin: `${CX} ${CY}` });
    // KR → ring, then the ring takes over frame by frame
    const first = ring(T0);
    const enter = gsap.timeline({
      onComplete: () => {
        started = performance.now();
        gsap.ticker.add(tick);
      },
    });
    paths.forEach((path, i) => enter.to(path, { morphSVG: first[i].d, strokeWidth: first[i].w, duration: 0.6, ease: 'power2.inOut' }, i * 0.03));

    return () => {
      enter.kill();
      if (started !== null) {
        gsap.ticker.remove(tick);
        // Hand the ring's momentum to a coasting turn: redraw it 90° ahead and turn the group back 90°
        // (the same picture), then glide the group to 0 while the arcs unfold into KR
        draw(ring(t, 90));
        gsap.set(spinner, { rotation: -90 });
        gsap.to(spinner, { rotation: 0, duration: 1, ease: 'power3.out' });
      }
      paths.forEach((path, i) => gsap.to(path, { morphSVG: KR_PATHS[i], strokeWidth: 20, duration: 0.85, ease: 'power2.inOut', delay: i * 0.04 }));
    };
  }, [loading]);

  // Unmounting mid-animation: drop anything still running on the detached nodes
  useEffect(() => () => {
    const svg = svgRef.current;
    if (svg) gsap.killTweensOf([svg, ...svg.querySelectorAll('path, [data-kr-spin]')]);
  }, []);

  return <KRLogo ref={svgRef} className={className} />;
}
