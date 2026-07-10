import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Magnetic } from '../shared/Magnetic';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { scrollToId, scrollToTop } from '../../lib/scroll';
import { useTheme } from '../../theme/ThemeProvider';

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contributions', label: 'Activity' },
  { id: 'courses', label: 'Courses' },
  { id: 'blog', label: 'Notes' },
  { id: 'contact', label: 'Contact' },
];

function HoverChars({ text }: { text: string }) {
  return (
    <span className="nav-link-chars" aria-hidden="true">
      {text.split('').map((c, i) => (
        <span key={i}>{c === ' ' ? ' ' : c}</span>
      ))}
    </span>
  );
}

export function Navbar({ loaderDone = true }: { loaderDone?: boolean }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [logoArmed, setLogoArmed] = useState(false);
  const [entered, setEntered] = useState(false);
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  const activeId = useScrollSpy(NAV.map((n) => n.id));

  useEffect(() => {
    if (!loaderDone) return;
    if (!isDesktop) { setEntered(true); return; }
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, [loaderDone, isDesktop]);

  useEffect(() => {
    const onArm = () => setLogoArmed(true);
    const onDisarm = () => setLogoArmed(false);
    document.addEventListener('secret:arm', onArm);
    document.addEventListener('secret:disarm', onDisarm);
    return () => {
      document.removeEventListener('secret:arm', onArm);
      document.removeEventListener('secret:disarm', onDisarm);
    };
  }, []);

  const go = (id: string) => {
    scrollToId(id);
    setOpen(false);
  };

  return (
    <motion.header
      initial={{ y: '-150%' }}
      animate={{ y: entered ? 0 : '-150%' }}
      transition={{ y: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: isDesktop ? 0.5 : 0 } }}
      className="fixed inset-x-0 top-4 z-40 px-4 md:px-6"
    >
      <div className="mx-auto max-w-[1400px] flex items-center justify-between">
        <Magnetic className="shrink-0">
        <button
          type="button"
          data-secret-logo
          onClick={() => scrollToTop()}
          onTouchStart={() => document.dispatchEvent(new CustomEvent('secret:logo-tap'))}
          data-cursor="hover"
          className="liquid-glass rounded-full h-12 w-12 grid place-items-center"
        >
          <motion.img
            src={theme === 'dark' ? '/KR_dark.png' : '/KR_light.png'}
            alt="Kevin Robin"
            width={36}
            height={36}
            initial={{ opacity: 0, y: -8 }}
            animate={logoArmed
              ? { opacity: [1, 0.3, 1], y: 0 }
              : entered ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
            transition={logoArmed
              ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: isDesktop ? 1.1 : 0 }}
            className="h-9 w-9 object-contain"
          />
        </button>
        </Magnetic>

        <nav className="hidden md:flex items-center gap-0.5 liquid-glass rounded-full px-1.5 py-1.5">
          {NAV.map((item, i) => {
            const isActive = activeId === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                data-cursor="hover"
                initial={{ opacity: 0, y: -8 }}
                animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: isDesktop ? 1.1 + i * 0.05 : 0 }}
                className="nav-link relative px-3 py-2 rounded-full font-mono text-[11px] uppercase tracking-[0.18em] transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="navPill"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-fg/10"
                  />
                )}
                <span className={`relative ${isActive ? 'text-fg' : 'text-fg/55 hover:text-fg'}`}>
                  <HoverChars text={item.label} />
                </span>
              </motion.button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Magnetic>
            <ThemeToggle />
          </Magnetic>
          <button
            type="button"
            data-cursor="hover"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
            className="md:hidden liquid-glass rounded-full h-12 w-12 grid place-items-center"
          >
            <motion.span animate={{ rotate: open ? 90 : 0 }} className="block">
              {open ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
              )}
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden mx-auto max-w-[1400px] mt-3 liquid-glass rounded-[1.25rem] px-6 py-3 flex flex-col"
          >
            {NAV.map((item, i) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                data-cursor="hover"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={`text-left py-2.5 hairline-b last:border-b-0 flex items-baseline gap-4 ${
                  activeId === item.id ? 'text-fg' : 'text-fg/60'
                }`}
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted">
                  ({String(i + 1).padStart(2, '0')})
                </span>
                <span className="display-type text-2xl">{item.label}</span>
              </motion.button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
