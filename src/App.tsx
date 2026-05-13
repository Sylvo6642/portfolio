import { AnimatePresence, MotionConfig } from 'framer-motion';
import { ThemeProvider } from './theme/ThemeProvider';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import { Navbar } from './components/layout/Navbar';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { BackToTop } from './components/layout/BackToTop';
import { CustomCursor } from './components/layout/CustomCursor';
import { FloatingDots } from './components/layout/FloatingDots';
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
        <AnimatePresence>
          {!done && <Loader key="loader" onDone={dismiss} />}
        </AnimatePresence>
        <ScrollProgress />
        <CustomCursor />
        <FloatingDots hideOverSelector="#hero" />
        <Navbar />
        <main className="relative" style={{ zIndex: 1 }}>
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
        <BackToTop />
      </MotionConfig>
    </ThemeProvider>
  );
}
