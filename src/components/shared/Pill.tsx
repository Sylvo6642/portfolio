import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function Pill({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return (
    <motion.span
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs hairline bg-bg/40 backdrop-blur-sm ${
        mono ? 'font-mono' : ''
      }`}
    >
      {children}
    </motion.span>
  );
}
