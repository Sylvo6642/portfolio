import Lenis from 'lenis';

let lenis: Lenis | null = null;

/**
 * Lenis inertia smooth scroll, phantom.land style.
 * No-ops when the user prefers reduced motion (native scrolling stays).
 */
export function initSmoothScroll() {
  if (lenis) return lenis;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });

  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  return lenis;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
