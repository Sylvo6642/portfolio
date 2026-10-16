import { useEffect, useState, type RefObject } from 'react';

export function useAutoHideNavbar(header: RefObject<HTMLElement>, locked: boolean) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let direction = 0;
    let distance = 0;
    let frame = 0;
    const hero = document.getElementById('hero');
    let heroHeight = hero?.offsetHeight ?? window.innerHeight;

    const update = () => {
      frame = 0;
      // Ignore overscroll bounce at either end of the document.
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const y = Math.max(0, Math.min(window.scrollY, maxY));
      const delta = y - lastY;
      lastY = y;

      if (locked || header.current?.querySelector(':focus-visible') || y <= heroHeight + 16) {
        setHidden(false);
        direction = 0;
        distance = 0;
        return;
      }

      if (Math.abs(delta) < 1) return;
      const nextDirection = Math.sign(delta);
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;

      // Hide deliberately; reveal with a shorter upward gesture. Small finger
      // movements never continually reverse the navbar's transition.
      if (distance >= (direction > 0 ? 40 : 16)) setHidden(direction > 0);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      lastY = window.scrollY;
      direction = 0;
      distance = 0;
    };
    const observer = new ResizeObserver(() => {
      heroHeight = hero?.offsetHeight ?? window.innerHeight;
    });
    if (hero) observer.observe(hero);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    if (locked) setHidden(false);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [header, locked]);

  return { hidden, reveal: () => setHidden(false) };
}
