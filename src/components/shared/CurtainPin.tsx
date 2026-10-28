import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Holds a section on screen once its bottom reaches the bottom of the screen, so the section after
 * it slides up over it like a curtain (as the intro does over the hero), dimming it as it's covered.
 * Once fully covered it stops being drawn, and `children` is told so it can pause any playback.
 * `overlap` (in screens) starts the next section rising that much earlier, over the section's own
 * last stretch of scroll, so it can still be moving underneath.
 */
export function CurtainPin({ children, next, overlap = 0 }: { children: (covered: boolean) => ReactNode; next: ReactNode; overlap?: number }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  // Pinned by its bottom edge: a sticky top of (screen − its height). Re-read when it resizes
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const el = pinRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 0 as the next section's top enters the bottom of the screen, 1 once it reaches the top
  const { scrollYProgress } = useScroll({ target: nextRef, offset: ['start end', 'start start'] });
  const shade = useTransform(scrollYProgress, [0, 1], [0, 0.45]);
  const [covered, setCovered] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setCovered(v >= 1));

  return (
    // Bounds the pin, so it lets go once the next section has scrolled past
    <div>
      <div
        ref={pinRef}
        className="sticky"
        style={{ top: height ? `calc(100dvh - ${height}px)` : undefined, zIndex: 0, visibility: covered ? 'hidden' : undefined }}
      >
        {children(covered)}
        {/* Only the last screen of it is ever seen while pinned */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[100dvh] bg-black" style={{ opacity: shade, willChange: 'opacity' }} />
      </div>
      <div ref={nextRef} className="relative" style={{ zIndex: 1, marginTop: overlap ? `${-overlap * 100}vh` : undefined }}>
        {next}
      </div>
    </div>
  );
}
