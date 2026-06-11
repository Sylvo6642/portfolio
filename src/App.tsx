import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { ThemeProvider } from './theme/ThemeProvider';
import { initSmoothScroll } from './lib/scroll';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import { useKonamiCode } from './hooks/useKonamiCode';
import { useMobileSecret } from './hooks/useMobileSecret';
import { TerminalGlitch } from './components/layout/TerminalGlitch';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { BackToTop } from './components/layout/BackToTop';
import { CustomCursor } from './components/layout/CustomCursor';
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
  useVisitorTracking();
  const { done, dismiss } = useLoader();
  const [glitch, setGlitch] = useState(false);
  const activate = () => { if (!glitch) setGlitch(true); };
  useKonamiCode(activate);
  useMobileSecret(activate);

  useEffect(() => {
    initSmoothScroll();
  }, []);

  if (isAdmin) {
    return (
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <CustomCursor />
          <Admin />
        </MotionConfig>
      </ThemeProvider>
    );
  }

  if (isNotFound) {
    return (
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <CustomCursor />
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
        <CustomCursor />
        <Navbar />
        {/* main scrolls over the fixed footer (curtain reveal) — its bottom
            margin must match the footer height */}
        <main className="relative bg-bg mb-[55vh] md:mb-[60vh]" style={{ zIndex: 1 }}>
          <Hero />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <GitHubContributions />
          <Courses />
          <Blog />
          <Contact />
        </main>
        <Footer />
        <BackToTop />
      </MotionConfig>
    </ThemeProvider>
  );
}
