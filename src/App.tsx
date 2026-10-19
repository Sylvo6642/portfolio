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
import { ScrollBar } from './components/layout/ScrollBar';
import { ChatWidget } from './components/chat/ChatWidget';
import { ChatHome } from './components/chat/ChatHome';
import { fetchQuota, type Quota } from './components/chat/quota';
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

// The chat home greets each new session on the bare home page; deep links skip it
const HOME_KEY = 'kr-chat-home-seen';
const wantsChatHome = (() => {
  if (path !== '/' || window.location.hash) return false;
  try { return sessionStorage.getItem(HOME_KEY) !== '1'; } catch { return true; }
})();

export default function App() {
  const mobile = useMobileLayout();
  useVisitorTracking();
  const { done, dismiss } = useLoader();
  // 'checking' until the API confirms the chat works, so the home never flashes up and away
  const [chatHome, setChatHome] = useState<'checking' | 'show' | 'hidden'>(wantsChatHome ? 'checking' : 'hidden');
  const [quota, setQuota] = useState<Quota | null>(null);
  const [glitch, setGlitch] = useState(false);
  const activate = () => { if (!glitch) setGlitch(true); };
  useKonamiCode(activate);
  useMobileSecret(activate);

  // Without a working chat (no API key, API down) go straight to the portfolio
  useEffect(() => {
    if (!wantsChatHome) return;
    // A slow API shouldn't hold the portfolio back
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
    Promise.race([fetchQuota(), timeout]).then((q) => {
      setQuota(q);
      setChatHome(q?.available ? 'show' : 'hidden');
    });
  }, []);

  const showPortfolio = () => {
    try { sessionStorage.setItem(HOME_KEY, '1'); } catch {}
    window.scrollTo(0, 0);
    setChatHome('hidden');
  };
  // The hero, scrollbar and chat button make their entrance once the portfolio is in view
  const portfolioReady = done && chatHome === 'hidden';

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
        <AnimatePresence>
          {chatHome === 'show' && <ChatHome key="chat-home" ready={done} quota={quota} onExit={showPortfolio} />}
        </AnimatePresence>
        <Navbar />
        <main className="relative bg-bg" style={{ zIndex: 1 }}>
          {/* Hero is sticky so the intro slides up over it like a curtain */}
          <div className="hero-curtain sticky top-0" style={{ zIndex: 0 }}>
            <Hero ready={portfolioReady} />
          </div>
          {/* On mobile, sections render already revealed. Dozens of reveal
              animations starting mid-scroll make iOS Safari re-rasterize text
              as each one ends, which reads as shimmering on the first pass. */}
          <AnimatePresence initial={!mobile}>
            <div key="sections" className="relative bg-bg" style={{ zIndex: 1 }}>
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
          </AnimatePresence>
        </main>
        <Footer />
        {portfolioReady && <ScrollBar />}
        <ChatWidget ready={portfolioReady} />
      </MotionConfig>
    </ThemeProvider>
  );
}
