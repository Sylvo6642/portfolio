import { motion, useMotionValueEvent, useScroll, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
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

export function Navbar() {
  const { scrollY } = useScroll();
  const { theme } = useTheme();
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [logoArmed, setLogoArmed] = useState(false);
  const activeId = useScrollSpy(NAV.map((n) => n.id));

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

  useMotionValueEvent(scrollY, 'change', (v) => setCompact(v > 20));

  const go = (id: string) => {
    scrollToId(id);
    setOpen(false);
  };

  return (
    <motion.header
      initial={false}
      animate={{
        paddingTop: compact ? 8 : 18,
        paddingBottom: compact ? 8 : 18,
        backdropFilter: compact || open ? 'blur(12px)' : 'blur(0px)',
        backgroundColor: compact || open ? 'rgb(var(--bg) / 0.7)' : 'rgb(var(--bg) / 0)',
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-40 ${compact || open ? 'hairline-b' : ''}`}
    >
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6">
        <button
          type="button"
          data-secret-logo
          onClick={() => scrollToTop()}
          onTouchStart={() => document.dispatchEvent(new CustomEvent('secret:logo-tap'))}
          data-cursor="hover"
          className="font-display font-extrabold uppercase tracking-tight text-sm relative"
        >
          <motion.img
            src={theme === 'dark' ? '/KR_dark.png' : '/KR_light.png'}
            alt="Kevin Robin"
            width={48}
            height={48}
            animate={logoArmed ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
            transition={logoArmed ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : {}}
            className="h-12 w-12 object-contain"
          />
        </button>

        <nav className="hidden md:flex items-center gap-5">
          {NAV.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                data-cursor="hover"
                className="nav-link relative py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors"
              >
                <span className={`relative ${isActive ? 'text-fg' : 'text-fg/55 hover:text-fg'}`}>
                  <HoverChars text={item.label} />
                </span>
                {isActive && (
                  <motion.span
                    layoutId="navUnderline"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    className="absolute -bottom-0.5 left-0 right-0 h-px bg-fg"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            data-cursor="hover"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
            className="md:hidden h-9 w-9 hairline grid place-items-center"
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
            className="md:hidden mx-auto max-w-[1400px] px-6 pb-6 pt-2 flex flex-col"
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
                className={`text-left py-2.5 hairline-b flex items-baseline gap-4 ${
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
