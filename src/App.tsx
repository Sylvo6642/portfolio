import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { ThemeProvider } from './theme/ThemeProvider';
import { initSmoothScroll, destroySmoothScroll } from './lib/scroll';
import { useMobileLayout } from './hooks/useMobileLayout';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import { useKonamiCode } from './hooks/useKonamiCode';
import { useMobileSecret } from './hooks/useMobileSecret';
import { TerminalGlitch } from './components/layout/TerminalGlitch';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { BackToTop } from './components/layout/BackToTop';
import { Loader, useLoader } from './components/layout/Loader';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Experience } from './components/sections/Experience';
import { Projects } from './components/sections/Projects';
import { GitHubContributions } from './components/sections/GitHubContributions';
import { Courses } from './components/sections/Courses';
import { Blog } from './components/sections/Blog';
import { Contact } from './components/sections/Contact';
import { Admin } from './components/sections/Admin';
import { NotFound } from './pages/NotFound';

const KNOWN_PATHS = ['/', '/admin'];
const path = window.location.pathname;
const isAdmin = path === '/admin';
const isNotFound = !KNOWN_PATHS.includes(path);

export default function App() {
  const mobile = useMobileLayout();
  useVisitorTracking();
  const { done, dismiss } = useLoader();
  const [glitch, setGlitch] = useState(false);
  const activate = () => { if (!glitch) setGlitch(true); };
  useKonamiCode(activate);
  useMobileSecret(activate);

  useEffect(() => {
    initSmoothScroll();
    return destroySmoothScroll;
  }, [mobile]);

  if (isAdmin) {
    return (
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <Admin />
        </MotionConfig>
      </ThemeProvider>
    );
  }

  if (isNotFound) {
    return (
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <NotFound />
        </MotionConfig>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        {glitch && <TerminalGlitch onDone={() => setGlitch(false)} />}
        <AnimatePresence>
          {!done && <Loader key="loader" onDone={dismiss} />}
        </AnimatePresence>
        <ScrollProgress />
        <Navbar loaderDone={done} />
        {/* main scrolls over the fixed footer (curtain reveal) — its bottom
            margin must match the footer height */}
        <main className="portfolio-main relative bg-bg mb-[55vh] md:mb-[60vh]" style={{ zIndex: 1 }}>
          {/* Hero is sticky so About slides up over it like a curtain */}
          <div className="hero-curtain sticky top-0" style={{ zIndex: 0 }}>
            <Hero />
          </div>
          <div className="relative bg-bg" style={{ zIndex: 1 }}>
            <About />
            <Skills />
            <Experience />
            <Projects />
            <GitHubContributions />
            <Courses />
            <Blog />
            <Contact />
          </div>
        </main>
        <Footer />
        <BackToTop />
      </MotionConfig>
    </ThemeProvider>
  );
}
