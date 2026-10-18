import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { scrollToY } from '../../lib/scroll';

const MIN_THUMB = 48;

/**
 * Floating page scrollbar for fine pointers. The native one is hidden (index.css)
 * because it reserves a gutter filled with the page colour, which shows as a light
 * strip beside the hero and the dark sections. This thumb overlays the page instead.
 */
export function ScrollBar() {
  const [enabled] = useState(() => window.matchMedia('(pointer: fine)').matches);
  const thumbRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const thumb = thumbRef.current;
    if (!thumb) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const view = window.innerHeight;
      const max = doc.scrollHeight - view;
      if (max <= 0) {
        thumb.style.opacity = '0';
        return;
      }
      const height = Math.max(MIN_THUMB, (view / doc.scrollHeight) * view);
      const top = (window.scrollY / max) * (view - height);
      thumb.style.opacity = '1';
      thumb.style.height = `${height}px`;
      thumb.style.transform = `translate3d(0, ${top}px, 0)`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Page height changes as sections reveal and accordions open
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [enabled]);

  if (!enabled) return null;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, startScroll: window.scrollY };
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const doc = document.documentElement;
    const view = window.innerHeight;
    const thumbHeight = thumbRef.current?.offsetHeight ?? MIN_THUMB;
    // Thumb travel maps linearly onto the scrollable distance
    const ratio = (doc.scrollHeight - view) / Math.max(1, view - thumbHeight);
    scrollToY(drag.current.startScroll + (event.clientY - drag.current.startY) * ratio);
  };
  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <div className="group fixed top-0 right-0 bottom-0 z-[80] w-3.5" aria-hidden>
      <div
        ref={thumbRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`absolute top-0 right-[3px] w-[5px] rounded-full opacity-0 shadow-[0_0_0_1px_rgb(251_248_244/0.35)] transition-[width,background-color] duration-200 group-hover:w-[7px] hover:bg-accent ${
          dragging ? 'w-[7px] bg-accent-hover' : 'bg-muted'
        }`}
      />
    </div>
  );
}
