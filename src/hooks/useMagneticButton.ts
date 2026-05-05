import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { useIsCoarsePointer } from './useMousePosition';

const SPRING = { stiffness: 180, damping: 18, mass: 0.8 };

export function useMagneticButton(strength = 0.38) {
  const ref = useRef<HTMLElement>(null);
  const coarse = useIsCoarsePointer();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (coarse || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    },
    [coarse, strength, x, y],
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { ref, x: sx, y: sy, onMove, onLeave };
}
