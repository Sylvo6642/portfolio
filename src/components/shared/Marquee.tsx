import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from 'framer-motion';
import { useRef, type ReactNode } from 'react';

/** Wrap a value into [min, max) for the seamless loop. */
function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/**
 * Infinite horizontal marquee, phantom.land style.
 * Content is duplicated once and the track loops over -50%…0%.
 * Scroll velocity feeds back into the speed — fast scrolling whips the
 * marquee along (and scrolling up reverses its direction).
 */
export function Marquee({
  children,
  baseVelocity = 1.6, // % of track per second
  reverse = false,
  className = '',
}: {
  children: ReactNode;
  baseVelocity?: number;
  reverse?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const directionFactor = useRef(reverse ? -1 : 1);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  // px/s of scroll → extra multiplier on the marquee speed
  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 5], { clamp: false });

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // Scrolling down speeds it up in its own direction; scrolling up reverses it
    const vf = velocityFactor.get();
    if (vf < 0) directionFactor.current = reverse ? 1 : -1;
    else if (vf > 0) directionFactor.current = reverse ? -1 : 1;

    moveBy += directionFactor.current * moveBy * Math.abs(vf);
    baseX.set(baseX.get() + moveBy);
  });

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  return (
    <div aria-hidden className={`overflow-hidden select-none ${className}`}>
      <motion.div className="flex w-max" style={{ x }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center">{children}</div>
      </motion.div>
    </div>
  );
}

/** Convenience: a row of uppercase display words separated by a glyph. */
export function MarqueeText({
  items,
  baseVelocity = 1.6,
  reverse = false,
  className = '',
  itemClassName = '',
}: {
  items: string[];
  baseVelocity?: number;
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <Marquee baseVelocity={baseVelocity} reverse={reverse} className={className}>
      {items.map((item, i) => (
        <span key={i} className={`flex items-center ${itemClassName}`}>
          <span className="display-type whitespace-nowrap">{item}</span>
          <span className="mx-6 md:mx-10 opacity-40">✦</span>
        </span>
      ))}
    </Marquee>
  );
}
