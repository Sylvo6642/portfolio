import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { scrollToTop } from '../../lib/scroll';

export function BackToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  useMotionValueEvent(scrollY, 'change', (v) => {
    setShow(v > 600);
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          data-cursor="hover"
          aria-label="Back to top"
          onClick={() => scrollToTop()}
          initial={{ rotate: -180, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 180, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover="hover"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full hairline bg-bg/70 backdrop-blur grid place-items-center group"
        >
          <svg
            className="absolute inset-0"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <motion.circle
              cx="24"
              cy="24"
              r="23"
              pathLength={1}
              initial={{ pathLength: 0 }}
              variants={{ hover: { pathLength: 1 } }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="text-accent"
              style={{ stroke: 'currentColor' }}
            />
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
