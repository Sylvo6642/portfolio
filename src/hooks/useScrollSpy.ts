import { useEffect, useState } from 'react';
import { scrollToId } from '../lib/scroll';

export function useScrollSpy(ids: string[], offset = 120) {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '');
  // Preserve the requested destination before scroll tracking updates the URL.
  const [initialHash] = useState(() => window.location.hash.slice(1));

  // On mount, scroll to the section matching the current hash
  useEffect(() => {
    const hash = initialHash;
    if (hash && ids.includes(hash)) {
      const el = document.getElementById(hash);
      if (el) {
        // Small delay to let the page finish rendering
        const timer = setTimeout(() => scrollToId(hash), 300);
        return () => clearTimeout(timer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Section tops are measured only when the page changes size, never while scrolling:
    // reading layout on every scroll event forced a reflow per frame
    let tops: { id: string; top: number }[] = [];
    let frame = 0;
    let lastId = '';
    let lastHash = window.location.hash;

    const measure = () => {
      tops = ids.flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [{ id, top: el.getBoundingClientRect().top + window.scrollY }] : [];
      });
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY + offset;
      let current = ids[0];
      for (const t of tops) if (t.top <= y) current = t.id;
      if (current !== lastId) {
        lastId = current;
        setActiveId(current);
      }

      // Update URL hash without adding to history
      const newHash = window.scrollY < 50 ? '' : `#${current}`;
      if (newHash !== lastHash) {
        lastHash = newHash;
        history.replaceState(null, '', newHash || window.location.pathname);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const remeasure = () => { measure(); schedule(); };

    measure();
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure);
    // Sections grow as content loads and accordions open
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
      observer.disconnect();
    };
  }, [ids, offset]);

  return activeId;
}
