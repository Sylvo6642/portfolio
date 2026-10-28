import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion';
import { ThemeProvider } from './theme/ThemeProvider';
import { initSmoothScroll, destroySmoothScroll } from './lib/scroll';
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
import { TWIRL_EXIT_SCREENS, WorkTwirl } from './components/sections/WorkTwirl';
import { CurtainPin } from './components/shared/CurtainPin';
import { GitHubContributions } from './components/sections/GitHubContributions';
import { Courses } from './components/sections/Courses';
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
  useVisitorTracking();
  const { done, dismiss } = useLoader();
  // 'checking' until the API confirms the chat works, so the home never flashes up and away
  const [chatHome, setChatHome] = useState<'checking' | 'show' | 'hidden'>(wantsChatHome ? 'checking' : 'hidden');
  const [quota, setQuota] = useState<Quota | null>(null);
  const chatAvailable = !!quota?.available;
  const [glitch, setGlitch] = useState(false);
  const activate = () => { if (!glitch) setGlitch(true); };
  useKonamiCode(activate);
  useMobileSecret(activate);

  // Without a working chat (no API key, API down) skip the chat home and the chat button
  useEffect(() => {
    if (path !== '/') return;
    // A slow API shouldn't hold the portfolio back
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
    Promise.race([fetchQuota(), timeout]).then((q) => {
      setQuota(q);
      if (wantsChatHome) setChatHome(q?.available ? 'show' : 'hidden');
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
  }, []);

  const reduced = useReducedMotion();

  // Once the sections have slid all the way over the sticky hero, stop drawing it: its ticker
  // and spinning globe otherwise keep costing frames behind the rest of the page
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroCovered, setHeroCovered] = useState(false);
  useEffect(() => {
    // The height is read on resize only, so scrolling never forces a layout here
    let height = 0;
    const check = () => setHeroCovered(window.scrollY > height + 50);
    const measure = () => {
      height = heroRef.current?.offsetHeight ?? window.innerHeight;
      check();
    };
    measure();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', measure);
    };
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
        <AnimatePresence>
          {chatHome === 'show' && <ChatHome key="chat-home" ready={done} quota={quota} onExit={showPortfolio} />}
        </AnimatePresence>
        <Navbar ready={portfolioReady} />
        <main className="relative bg-bg" style={{ zIndex: 1 }}>
          {/* Hero is sticky so the intro slides up over it like a curtain */}
          <div ref={heroRef} className="hero-curtain sticky top-0" style={{ zIndex: 0, visibility: heroCovered ? 'hidden' : undefined }}>
            <Hero ready={portfolioReady} />
          </div>
          <div className="relative bg-bg" style={{ zIndex: 1 }}>
            <Intro />
            {/* The work list slides up over the twirl while its tiles are still spiralling off, as the
                intro does over the hero. Reduce Motion has no twirl, so the list waits for its end */}
            <CurtainPin next={<Projects />} overlap={reduced ? 0 : TWIRL_EXIT_SCREENS}>
              {(covered) => <WorkTwirl paused={covered} />}
            </CurtainPin>
            <About />
            <Skills />
            <Experience />
            <GitHubContributions />
            <Courses />
            <Contact />
          </div>
        </main>
        <Footer />
        {portfolioReady && <ScrollBar />}
        <ChatWidget ready={portfolioReady && chatAvailable} />
      </MotionConfig>
    </ThemeProvider>
  );
}
