import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { KR_PENS, KRLogo } from '../shared/KRLogo';

/* One loop: the pens lift off the mark in drawing order, then write it back in, then it holds whole
   for a beat. Every loop starts and ends on the whole mark, so stopping at a loop's end is seamless */
const LIFT = { duration: 0.42, stagger: 0.06, ease: 'power2.in' };
const WRITE = { at: 0.7, duration: 0.5, stagger: 0.09, ease: 'power2.out' };
const LOOP_S = 2.1;

/** The KR logo, which keeps rewriting itself while `loading`, then finishes its stroke and rests (`onRest`) */
export function KRLoader({ loading, className, onRest }: { loading: boolean; className?: string; onRest?: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const loopRef = useRef<gsap.core.Timeline | null>(null);
  const onRestRef = useRef(onRest);
  onRestRef.current = onRest;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Loading stopped: let the running loop finish on the whole mark rather than cut it short
    if (!loading) {
      const loop = loopRef.current;
      if (loop) loop.eventCallback('onRepeat', () => stop(svg, loop));
      else onRestRef.current?.();
      return;
    }

    // Reduced motion: a gentle pulse instead of the pen strokes
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const pulse = gsap.to(svg, { opacity: 0.45, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      return () => {
        pulse.kill();
        gsap.to(svg, { opacity: 1, duration: 0.4, onComplete: () => onRestRef.current?.() });
      };
    }

    // Already looping (loading flicked off and on again): just keep it going
    if (loopRef.current) {
      loopRef.current.eventCallback('onRepeat', null);
      return;
    }

    const ink = svg.querySelector<SVGPathElement>('[data-kr-ink]')!;
    const pens = [...svg.querySelectorAll<SVGPathElement>('[data-kr-pen]')];
    ink.setAttribute('mask', `url(#${svg.querySelector('mask')!.id})`);
    gsap.set(pens, { strokeDashoffset: 0 });

    const loop = gsap.timeline({ repeat: -1 });
    pens.forEach((pen, i) => {
      const len = KR_PENS[i].len;
      // Lifting runs the dash on past the stroke's start, so each pen clears from where it began
      loop.to(pen, { strokeDashoffset: -len, duration: LIFT.duration, ease: LIFT.ease }, i * LIFT.stagger);
      loop.fromTo(pen, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: WRITE.duration, ease: WRITE.ease, immediateRender: false }, WRITE.at + i * WRITE.stagger);
    });
    loop.set({}, {}, LOOP_S);
    loopRef.current = loop;
  }, [loading]);

  function stop(svg: SVGSVGElement, loop: gsap.core.Timeline) {
    loop.kill();
    loopRef.current = null;
    gsap.set(svg.querySelectorAll('[data-kr-pen]'), { clearProps: 'strokeDashoffset' });
    svg.querySelector('[data-kr-ink]')?.removeAttribute('mask');
    onRestRef.current?.();
  }

  // Unmounting mid-loop: drop anything still running on the detached nodes
  useEffect(() => () => {
    loopRef.current?.kill();
    const svg = svgRef.current;
    if (svg) gsap.killTweensOf([svg, ...svg.querySelectorAll('[data-kr-pen]')]);
  }, []);

  return <KRLogo ref={svgRef} className={className} />;
}
