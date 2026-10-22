import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Magnetic } from '../shared/Magnetic';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { scrollToId, scrollToTop, setScrollLocked } from '../../lib/scroll';

const HEADER_LINKS = [
  { id: 'projects', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];
const DRAWER_LINKS = [
  { id: 'hero', label: 'Home' },
  { id: 'projects', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'contributions', label: 'Activity' },
  { id: 'courses', label: 'Courses' },
  { id: 'contact', label: 'Contact' },
];
// Document order — the scroll spy needs it to pick the section in view
const SECTIONS = ['hero', 'projects', 'about', 'skills', 'experience', 'contributions', 'courses', 'contact'];
export const SOCIALS = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/kevinsylvester6642' },
  { label: 'GitHub', href: 'https://github.com/Sylvo6642' },
  { label: 'Email', href: 'mailto:kevinrobin673@gmail.com' },
];

const EASE = [0.76, 0, 0.24, 1] as const;

function goTo(id: string) {
  if (id === 'hero') scrollToTop();
  else scrollToId(id);
}

/* Drawer panel's left edge bows outward while it slides in, then flattens */
function DrawerCurve() {
  const [h] = useState(() => window.innerHeight);
  const curved = `M100 0 L100 ${h} Q-100 ${h / 2} 100 0`;
  const flat = `M100 0 L100 ${h} Q100 ${h / 2} 100 0`;
  return (
    <svg className="absolute top-0 -left-[99px] w-[100px] h-full pointer-events-none" preserveAspectRatio="none" viewBox={`0 0 100 ${h}`} aria-hidden>
      <motion.path
        className="fill-ink"
        initial={{ d: curved }}
        animate={{ d: flat, transition: { duration: 1, ease: EASE } }}
        exit={{ d: curved, transition: { duration: 0.8, ease: EASE } }}
      />
    </svg>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const activeId = useScrollSpy(SECTIONS);

  // The floating menu button takes over once the header has scrolled away
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > Math.min(160, window.innerHeight * 0.2));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      burgerRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      setScrollLocked(false);
    };
  }, [open]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (open) {
      setOpen(false);
      // Let the scroll lock release before scrolling
      window.setTimeout(() => goTo(id), 80);
    } else {
      goTo(id);
    }
  };

  return (
    <>
      {/* Top bar — sits over the hero and scrolls away with it */}
      <header className="absolute top-0 inset-x-0 z-30 text-white">
        <div className="flex items-center justify-end px-5 pt-5 sm:px-8 md:px-10 md:pt-8">

          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-base" aria-label="Main navigation">
            {HEADER_LINKS.map((item) => (
              <Magnetic key={item.id} strength={0.25}>
                <a href={`#${item.id}`} onClick={(event) => go(event, item.id)} className="nav-link" aria-current={activeId === item.id ? 'location' : undefined}>
                  {item.label}
                </a>
              </Magnetic>
            ))}
            <ThemeToggle />
          </nav>

          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button type="button" onClick={() => setOpen(true)} className="nav-link text-[15px] pl-2" aria-expanded={open} aria-controls="site-drawer">
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Floating menu button — while hidden it must not swallow clicks meant for the header beneath */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 md:top-7 md:right-7 z-[70] pointer-events-none">
        <motion.div
          className={scrolled || open ? 'pointer-events-auto' : ''}
          initial={false}
          animate={{ scale: scrolled || open ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Magnetic strength={0.3}>
            <button
              ref={burgerRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="site-drawer"
              tabIndex={scrolled || open ? 0 : -1}
              className={`btn-round h-14 w-14 md:h-[76px] md:w-[76px] shadow-[0_8px_30px_rgb(0_0_0/0.18)] transition-colors duration-300 ${open ? 'bg-accent' : 'bg-ink ring-1 ring-white/10'} group`}
              data-cursor="hover"
            >
              <span aria-hidden className="btn-fill bg-accent" />
              <span className="relative z-[1] block w-5 md:w-6 h-3">
                <span className={`absolute left-0 right-0 h-px transition-all duration-300 ${open ? 'top-1/2 rotate-45 bg-on-accent' : 'top-0 bg-white group-hover:bg-on-accent'}`} />
                <span className={`absolute left-0 right-0 h-px transition-all duration-300 ${open ? 'top-1/2 -rotate-45 bg-on-accent' : 'top-full bg-white group-hover:bg-on-accent'}`} />
              </span>
            </button>
          </Magnetic>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-[55] bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              key="drawer"
              id="site-drawer"
              aria-label="Site menu"
              className="on-ink fixed top-0 right-0 bottom-0 z-[60] w-full sm:w-[min(500px,100vw)]"
              initial={{ x: 'calc(100% + 100px)' }}
              animate={{ x: 0, transition: { duration: 0.8, ease: EASE } }}
              exit={{ x: 'calc(100% + 100px)', transition: { duration: 0.8, ease: EASE } }}
            >
              <DrawerCurve />
              <div className="relative h-full overflow-y-auto overscroll-contain flex flex-col justify-between gap-12 px-8 pt-24 pb-10 sm:px-14 md:pt-28" data-lenis-prevent>
                <div>
                  <p className="eyebrow pb-5 mb-8 border-b border-fg/15">Navigation</p>
                  <nav aria-label="All sections">
                    <ul className="flex flex-col">
                      {DRAWER_LINKS.map((item, i) => {
                        const current = activeId === item.id;
                        return (
                          <motion.li
                            key={item.id}
                            initial={{ x: 80 }}
                            animate={{ x: 0, transition: { duration: 0.8, ease: EASE, delay: 0.05 * i } }}
                            exit={{ x: 80, transition: { duration: 0.8, ease: EASE, delay: 0.03 * i } }}
                          >
                            <a
                              href={`#${item.id}`}
                              onClick={(event) => go(event, item.id)}
                              aria-current={current ? 'location' : undefined}
                              className="group relative flex items-center py-1 text-[clamp(2rem,5.4vh,3.25rem)] leading-[1.15] tracking-[-0.03em]"
                            >
                              <span
                                aria-hidden
                                className={`absolute -left-6 h-2.5 w-2.5 rounded-full bg-white transition-transform duration-300 ${current ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}
                              />
                              {item.label}
                            </a>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>

                <div>
                  <p className="eyebrow mb-4">Socials</p>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px]">
                    {SOCIALS.map((s) => (
                      <a key={s.label} href={s.href} className="nav-link" target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
