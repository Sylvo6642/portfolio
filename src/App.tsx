import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './theme/ThemeProvider';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import { Navbar } from './components/layout/Navbar';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { BackToTop } from './components/layout/BackToTop';
import { CustomCursor } from './components/layout/CustomCursor';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Experience } from './components/sections/Experience';
import { Projects } from './components/sections/Projects';
import { Courses } from './components/sections/Courses';
import { Blog } from './components/sections/Blog';
import { Contact } from './components/sections/Contact';

export default function App() {
  useVisitorTracking();

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <ScrollProgress />
        <CustomCursor />
        <Navbar />
        <main>
          <Hero />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Courses />
          <Blog />
          <Contact />
        </main>
        <BackToTop />
      </MotionConfig>
    </ThemeProvider>
  );
}
