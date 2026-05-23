import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useIsCoarsePointer } from '../../hooks/useMousePosition';

const SIZE = 14; // px

export function CustomCursor() {
  const coarse = useIsCoarsePointer();
  const [reduced, setReduced] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Center the cursor on the pointer regardless of scale
  const cx = useTransform(x, (v) => v - SIZE / 2);
  const cy = useTransform(y, (v) => v - SIZE / 2);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(m.matches);
    const fn = () => setReduced(m.matches);
    m.addEventListener?.('change', fn);
    return () => m.removeEventListener?.('change', fn);
  }, []);

  useEffect(() => {
    if (coarse || reduced) {
      document.body.classList.remove('has-custom-cursor');
      return;
    }
    document.body.classList.add('has-custom-cursor');

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      setHovering(!!t.closest('[data-cursor="hover"], a, button, input, textarea, label'));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [coarse, reduced, visible, x, y]);

  if (coarse || reduced) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        x: cx,
        y: cy,
        width: SIZE,
        height: SIZE,
      }}
      animate={{ scale: hovering ? 2.6 : 1, opacity: visible ? 1 : 0 }}
      transition={{
        scale: { type: 'spring', stiffness: 400, damping: 30 },
        opacity: { duration: 0.15 },
      }}
      className="pointer-events-none fixed top-0 left-0 z-[100] rounded-full bg-accent"
    />
  );
}
