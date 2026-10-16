import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { scrollToId, scrollToTop } from '../../lib/scroll';
import { useAutoHideNavbar } from '../../hooks/useAutoHideNavbar';

const PRIMARY = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'blog', label: 'Notes' },
];
const MORE = [
  { id: 'skills', label: 'Skills', detail: 'Tools & technologies' },
  { id: 'contributions', label: 'Activity', detail: 'Building in public' },
  { id: 'courses', label: 'Courses', detail: 'Always learning' },
];
const SECTIONS = ['about', 'skills', 'experience', 'projects', 'contributions', 'courses', 'blog', 'contact'];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={diagonal ? 'M7 17 17 7M7 7h10v10' : 'M5 12h14m-6-6 6 6-6 6'} /></svg>;
}

export function Navbar({ loaderDone = true }: { loaderDone?: boolean }) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [logoArmed, setLogoArmed] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const activeId = useScrollSpy(SECTIONS);
  const { hidden, reveal } = useAutoHideNavbar(headerRef, open || moreOpen || !loaderDone);

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

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setMoreOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (open) menuRef.current?.focus();
      else if (moreOpen) moreRef.current?.focus();
      setOpen(false);
      setMoreOpen(false);
    };
    let lastWidth = window.innerWidth;
    const onResize = () => {
      // Mobile browser toolbars change height while scrolling a menu.
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      setOpen(false);
      setMoreOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open, moreOpen]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    scrollToId(id);
    setOpen(false);
    setMoreOpen(false);
  };

  return (
    <header ref={headerRef} className="site-header" data-hidden={hidden || !loaderDone}
      aria-hidden={!loaderDone} style={{ visibility: loaderDone ? 'visible' : 'hidden' }}
      onFocusCapture={reveal}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) { setOpen(false); setMoreOpen(false); }
      }}>
      <div className="nav-shell">
        <a href="#" className="nav-brand" aria-label="Kevin Robin — back to top" data-secret-logo
          onClick={(event) => { event.preventDefault(); scrollToTop(); setOpen(false); setMoreOpen(false); }}
          onTouchStart={() => document.dispatchEvent(new CustomEvent('secret:logo-tap'))}>
          <motion.span className="nav-monogram" animate={{ opacity: logoArmed ? [1, 0.3, 1] : 1 }} transition={logoArmed ? { duration: 0.8, repeat: Infinity } : { duration: 0.2 }}>
            <img src="/kevin.jpg" alt="" width="44" height="44" decoding="async" />
          </motion.span>
          <span className="nav-wordmark">Kevin Robin<span>Full-stack developer</span></span>
        </a>
        <nav className="nav-desktop" aria-label="Main navigation">
          {PRIMARY.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={(event) => go(event, item.id)} className="nav-item" aria-current={activeId === item.id ? 'location' : undefined}>{item.label}</a>
          ))}
          <div className="nav-more">
            <button ref={moreRef} type="button" className="nav-item nav-more-trigger"
              data-active={MORE.some((item) => item.id === activeId)} aria-expanded={moreOpen} aria-controls="nav-more-links"
              onClick={() => setMoreOpen((value) => !value)}>
              More<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={moreOpen ? 'is-open' : ''}><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {moreOpen && (
              <div id="nav-more-links" className="nav-dropdown">
                <span className="nav-eyebrow">Explore more</span>
                {MORE.map((item) => (
                  <a key={item.id} href={`#${item.id}`} onClick={(event) => go(event, item.id)} aria-current={activeId === item.id ? 'location' : undefined}>
                    <span>{item.label}<small>{item.detail}</small></span><Arrow diagonal />
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <a href="#contact" className="nav-contact" onClick={(event) => go(event, 'contact')} aria-current={activeId === 'contact' ? 'location' : undefined}>Let’s talk<Arrow diagonal /></a>
          <button ref={menuRef} type="button" className="nav-menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="nav-mobile-links" onClick={() => setOpen((value) => !value)}>
            <span className={open ? 'is-open' : ''}><i /><i /></span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav id="nav-mobile-links" aria-label="Mobile navigation" className="nav-mobile" data-lenis-prevent
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div className="nav-mobile-heading"><span className="nav-eyebrow">Explore the portfolio</span><span>01 — 08</span></div>
            {SECTIONS.map((id, index) => {
              const item = [...PRIMARY, ...MORE, { id: 'contact', label: 'Contact' }].find((entry) => entry.id === id)!;
              return <a key={id} href={`#${id}`} onClick={(event) => go(event, id)} aria-current={activeId === id ? 'location' : undefined}>
                <span className="nav-mobile-number">{String(index + 1).padStart(2, '0')}</span><span>{item.label}</span><Arrow />
              </a>;
            })}
            <p className="nav-mobile-footer">Have something in mind? <a href="#contact" onClick={(event) => go(event, 'contact')}>Let’s build it together <Arrow diagonal /></a></p>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
