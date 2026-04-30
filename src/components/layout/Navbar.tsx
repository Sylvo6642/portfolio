import { motion, useMotionValueEvent, useScroll, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useScrollSpy } from '../../hooks/useScrollSpy';

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
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
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const activeId = useScrollSpy(NAV.map((n) => n.id));

  useMotionValueEvent(scrollY, 'change', (v) => setCompact(v > 20));

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const target = el.getBoundingClientRect().top + window.scrollY;
    const start = window.scrollY;
    const dist = target - start;
    const duration = 800;
    let startTime: number | null = null;
    const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start + dist * ease(progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setOpen(false);
  };

  return (
    <motion.header
      initial={false}
      animate={{
        paddingTop: compact ? 8 : 18,
        paddingBottom: compact ? 8 : 18,
        backdropFilter: compact ? 'blur(12px)' : 'blur(0px)',
        backgroundColor: compact ? 'rgb(var(--bg) / 0.7)' : 'rgb(var(--bg) / 0)',
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-40 ${compact ? 'hairline-b' : ''}`}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          data-cursor="hover"
          className="font-mono text-sm tracking-tight"
        >
          <span className="text-accent">~/</span>kevin-robin
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                data-cursor="hover"
                className="nav-link relative rounded-full px-3 py-1.5 text-sm transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="navPill"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-fg/10"
                  />
                )}
                <span className={`relative ${isActive ? 'text-fg' : 'text-fg/70'}`}>
                  <HoverChars text={item.label} />
                </span>
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
            className="md:hidden h-9 w-9 rounded-full hairline grid place-items-center"
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
            className="md:hidden mx-auto max-w-6xl px-6 pb-4 pt-2 flex flex-col gap-1"
          >
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                data-cursor="hover"
                className={`text-left px-3 py-2 rounded-md text-sm ${
                  activeId === item.id ? 'bg-fg/10 text-fg' : 'text-fg/70'
                }`}
              >
                {item.label}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
