import { motion, useScroll, useTransform } from 'framer-motion';
import { useMobileLayout } from '../../hooks/useMobileLayout';

/**
 * Curtain footer, phantom.land style.
 * Fixed behind <main> (which carries an equal bottom margin), so the page
 * content slides up like a curtain and uncovers the giant wordmark.
 * The wordmark rises with page scroll as the curtain opens (IntersectionObserver
 * can't tell when a fixed element is uncovered, so this is scroll-driven).
 */
export function Footer() {
  const mobile = useMobileLayout();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0.86, 1], [90, 0]);
  const opacity = useTransform(scrollYProgress, [0.86, 0.98], [0, 1]);

  return (
    <footer
      aria-label="Site footer"
      className="site-footer fixed bottom-0 left-0 right-0 z-0 h-[55vh] md:h-[60vh] flex flex-col justify-end overflow-hidden"
    >
      <div className="mx-auto max-w-[1400px] w-full px-6 flex-1 flex flex-col justify-center">
        <motion.p
          style={{ y: mobile ? 0 : y, opacity: mobile ? 1 : opacity, fontSize: 'clamp(3.2rem, 12.5vw, 12rem)', lineHeight: 0.85 }}
          className="display-type text-center select-none"
        >
          Kevin <span className="stroke-text">Robin</span>
        </motion.p>
      </div>

      <div className="mx-auto max-w-[1400px] w-full px-6 pb-8">
        <div className="hairline-t pt-6 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-muted">
          <span>© {new Date().getFullYear()} Kevin Robin</span>
        </div>
      </div>
    </footer>
  );
}
