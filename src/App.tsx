import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { ThemeProvider } from './theme/ThemeProvider';
import { initSmoothScroll, destroySmoothScroll } from './lib/scroll';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import { useKonamiCode } from './hooks/useKonamiCode';
import { useMobileSecret } from './hooks/useMobileSecret';
import { TerminalGlitch } from './components/layout/TerminalGlitch';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollBar } from './components/layout/ScrollBar';
import { Loader, useLoader } from './components/layout/Loader';
import { Hero } from './components/sections/Hero';
import { Intro } from './components/sections/Intro';
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
    return destroySmoothScroll;
  }, []);

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
        <Navbar />
        <main className="relative bg-bg" style={{ zIndex: 1 }}>
          {/* Hero is sticky so the intro slides up over it like a curtain */}
          <div className="hero-curtain sticky top-0" style={{ zIndex: 0 }}>
            <Hero ready={done} />
          </div>
          <div className="relative bg-bg" style={{ zIndex: 1 }}>
            <Intro />
            <Projects />
            <About />
            <Skills />
            <Experience />
            <GitHubContributions />
            <Courses />
            <Blog />
            <Contact />
          </div>
        </main>
        <Footer />
        {done && <ScrollBar />}
      </MotionConfig>
    </ThemeProvider>
  );
}
