import Lenis from 'lenis';

let lenis: Lenis | null = null;
let animationFrame = 0;

/**
 * Lenis inertia smooth scroll, phantom.land style.
 * Keep native scrolling on touch devices, small screens, and reduced motion.
 */
export function initSmoothScroll() {
  if (lenis) return lenis;
  if (window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 767px), (pointer: coarse)').matches) return null;

  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });

  const raf = (time: number) => {
    lenis?.raf(time);
    animationFrame = requestAnimationFrame(raf);
  };
  animationFrame = requestAnimationFrame(raf);

  return lenis;
}

export function destroySmoothScroll() {
  cancelAnimationFrame(animationFrame);
  lenis?.destroy();
  lenis = null;
}

export function scrollToId(id: string) {
  const section = document.getElementById(id);
  // A contact CTA should arrive at the actionable content, below its intro.
  const el = section?.querySelector<HTMLElement>('[data-scroll-target]') ?? section;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: -104, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 104, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
}

export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
