import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GLITCH_STYLES = `
@keyframes glitch-in {
  0%   { clip-path: inset(0% 0 100% 0);  transform: translate(0,0) skewX(0deg);        opacity: 0;   filter: brightness(1); }
  5%   { clip-path: inset(45% 0 45% 0);  transform: translate(-20px,0) skewX(-8deg);   opacity: 1;   filter: brightness(8) hue-rotate(180deg); }
  10%  { clip-path: inset(10% 0 80% 0);  transform: translate(18px,0) skewX(6deg);     opacity: 0.6; filter: brightness(5) hue-rotate(-90deg); }
  15%  { clip-path: inset(75% 0 5% 0);   transform: translate(-14px,0) skewX(-5deg);   opacity: 1;   filter: brightness(6); }
  20%  { clip-path: inset(0% 0 0% 0);    transform: translate(12px,0) skewX(3deg);     opacity: 0.8; filter: brightness(3); }
  25%  { clip-path: inset(30% 0 55% 0);  transform: translate(-8px,0) skewX(-3deg);    opacity: 1;   filter: brightness(4) hue-rotate(45deg); }
  32%  { clip-path: inset(0% 0 0% 0);    transform: translate(6px,0);                  opacity: 1;   filter: brightness(2); }
  40%  { clip-path: inset(20% 0 70% 0);  transform: translate(-4px,0) skewX(-1deg);    opacity: 1;   filter: brightness(1.5); }
  50%  { clip-path: inset(0% 0 0% 0);    transform: translate(2px,0);                  opacity: 1;   filter: brightness(1); }
  62%  { clip-path: inset(8% 0 4% 0);    transform: translate(-2px,0);                 opacity: 1;   filter: brightness(1.2); }
  75%  { clip-path: inset(0% 0 0% 0);    transform: translate(1px,0);                  opacity: 1;   filter: brightness(1); }
  88%  { clip-path: inset(2% 0 1% 0);    transform: translate(-1px,0);                 opacity: 1;   filter: brightness(1); }
  100% { clip-path: inset(0% 0 0% 0);    transform: translate(0,0);                    opacity: 1;   filter: brightness(1); }
}

@keyframes glitch-out {
  0%   { clip-path: inset(0% 0 0% 0);    transform: translate(0,0);                    opacity: 1;   filter: brightness(1); }
  8%   { clip-path: inset(15% 0 70% 0);  transform: translate(6px,0) skewX(2deg);      opacity: 1;   filter: brightness(1.5); }
  16%  { clip-path: inset(0% 0 0% 0);    transform: translate(-4px,0);                 opacity: 1;   filter: brightness(1); }
  24%  { clip-path: inset(50% 0 35% 0);  transform: translate(10px,0) skewX(-3deg);    opacity: 0.8; filter: brightness(2); }
  32%  { clip-path: inset(0% 0 0% 0);    transform: translate(-8px,0);                 opacity: 1;   filter: brightness(1.5) hue-rotate(30deg); }
  42%  { clip-path: inset(65% 0 20% 0);  transform: translate(16px,0) skewX(5deg);     opacity: 1;   filter: brightness(4) hue-rotate(-60deg); }
  50%  { clip-path: inset(0% 0 0% 0);    transform: translate(-14px,0);                opacity: 0.5; filter: brightness(6); }
  58%  { clip-path: inset(30% 0 55% 0);  transform: translate(20px,0) skewX(-7deg);    opacity: 1;   filter: brightness(8) hue-rotate(120deg); }
  65%  { clip-path: inset(0% 0 0% 0);    transform: translate(-18px,0) skewX(6deg);    opacity: 0.3; filter: brightness(10) hue-rotate(-180deg); }
  72%  { clip-path: inset(80% 0 5% 0);   transform: translate(22px,0) skewX(-8deg);    opacity: 1;   filter: brightness(12); }
  80%  { clip-path: inset(45% 0 45% 0);  transform: translate(-20px,0) skewX(9deg);    opacity: 0.2; filter: brightness(15) hue-rotate(90deg); }
  88%  { clip-path: inset(10% 0 85% 0);  transform: translate(16px,0) skewX(-6deg);    opacity: 0.6; filter: brightness(8); }
  94%  { clip-path: inset(90% 0 2% 0);   transform: translate(-12px,0);                opacity: 0.1; filter: brightness(20); }
  100% { clip-path: inset(50% 0 50% 0);  transform: translate(0,0);                    opacity: 0;   filter: brightness(1); }
}

@keyframes rgb-r {
  0%, 100% { transform: translate(0, 0); }
  20%  { transform: translate(-3px, 0); }
  40%  { transform: translate(3px, 1px); }
  60%  { transform: translate(-2px, 0); }
  80%  { transform: translate(2px, -1px); }
}
@keyframes rgb-b {
  0%, 100% { transform: translate(0, 0); }
  20%  { transform: translate(3px, 0); }
  40%  { transform: translate(-3px, -1px); }
  60%  { transform: translate(2px, 0); }
  80%  { transform: translate(-2px, 1px); }
}
@keyframes glitch-burst {
  0%   { clip-path: inset(0 0 0 0);   transform: translate(0, 0);               filter: brightness(1); }
  15%  { clip-path: inset(25% 0 60% 0); transform: translate(-12px, 0) skewX(-4deg); filter: brightness(3) hue-rotate(90deg); }
  30%  { clip-path: inset(0 0 0 0);   transform: translate(10px, 0);            filter: brightness(1); }
  45%  { clip-path: inset(55% 0 20% 0); transform: translate(8px, 0) skewX(3deg);  filter: brightness(2) hue-rotate(-60deg); }
  60%  { clip-path: inset(0 0 0 0);   transform: translate(-4px, 0);            filter: brightness(1.5); }
  75%  { clip-path: inset(10% 0 75% 0); transform: translate(6px, 0);              filter: brightness(1); }
  100% { clip-path: inset(0 0 0 0);   transform: translate(0, 0);               filter: brightness(1); }
}

@keyframes slice-tear {
  0%, 100% { clip-path: inset(0 0 100% 0); opacity: 0; }
  10%  { clip-path: inset(22% 0 70% 0); opacity: 0.7; transform: translateX(12px); }
  20%  { clip-path: inset(0 0 100% 0); opacity: 0; }
  45%  { clip-path: inset(55% 0 38% 0); opacity: 0.5; transform: translateX(-8px); }
  55%  { clip-path: inset(0 0 100% 0); opacity: 0; }
  80%  { clip-path: inset(10% 0 82% 0); opacity: 0.6; transform: translateX(6px); }
  90%  { clip-path: inset(0 0 100% 0); opacity: 0; }
}
`;

type LineConfig = {
  text: string;
  color?: string;
  delay?: number;      // ms pause before this line starts
  typeSpeed?: number;  // ms per character
  pauseAfter?: number; // ms pause after line completes
};

const SCRIPT: LineConfig[] = [
  { text: 'BIOS v2.4.1 — kevinsylvester.xyz', color: '#4a4a5a', delay: 0, typeSpeed: 28 },
  { text: 'Checking system integrity...', color: '#6b6b7a', delay: 120, typeSpeed: 22, pauseAfter: 400 },
  { text: 'RAM: 16384MB OK', color: '#00cc33', delay: 0, typeSpeed: 18 },
  { text: 'CPU: Full-Stack Dev Core [8T] @ 3.6GHz', color: '#00cc33', delay: 60, typeSpeed: 18 },
  { text: 'STORAGE: Projects [∞] — mounted', color: '#00cc33', delay: 60, typeSpeed: 18, pauseAfter: 300 },
  { text: 'Loading kernel modules...', color: '#6b6b7a', delay: 100, typeSpeed: 22 },
  { text: '  [  OK  ] react@18.3 ................ loaded', color: '#00cc33', delay: 180, typeSpeed: 14 },
  { text: '  [  OK  ] vite@5.3 .................. loaded', color: '#00cc33', delay: 120, typeSpeed: 14 },
  { text: '  [  OK  ] tailwindcss@3.4 ........... loaded', color: '#00cc33', delay: 120, typeSpeed: 14 },
  { text: '  [  OK  ] framer-motion@11.3 ........ loaded', color: '#00cc33', delay: 120, typeSpeed: 14 },
  { text: '  [ WARN ] canvas.connecting-dots .... experimental', color: '#f59e0b', delay: 200, typeSpeed: 14 },
  { text: '  [  OK  ] supabase-edge ............. connected', color: '#00cc33', delay: 160, typeSpeed: 14, pauseAfter: 400 },
  { text: 'Mounting filesystem...', color: '#6b6b7a', delay: 100, typeSpeed: 22 },
  { text: '  /projects ........... rw  [clausify, portfolio, commitgrid, skilldash]', color: '#00cc33', delay: 200, typeSpeed: 10 },
  { text: '  /skills ............. rw  [react, django, angular, node, postgres]', color: '#00cc33', delay: 120, typeSpeed: 10 },
  { text: '  /contact ............ rw  [robinkevin648@gmail.com]', color: '#00cc33', delay: 120, typeSpeed: 10, pauseAfter: 500 },
  { text: 'Running diagnostics...', color: '#6b6b7a', delay: 100, typeSpeed: 22 },
  { text: '  > ping linkedin.com/in/kevinsylvester6642 .... 12ms', color: '#00cc33', delay: 300, typeSpeed: 12 },
  { text: '  > curl kevinsylvester.xyz ................... 200 OK', color: '#00cc33', delay: 400, typeSpeed: 12 },
  { text: '  > check availability ........................ OPEN', color: '#00ff41', delay: 500, typeSpeed: 12, pauseAfter: 600 },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', color: '#2a2a3a', delay: 0, typeSpeed: 5 },
  { text: '  YOU FOUND THE SECRET. NICE.', color: '#f0a05c', delay: 200, typeSpeed: 35, pauseAfter: 300 },
  { text: '  status   : available for hire ✓', color: '#00ff41', delay: 100, typeSpeed: 22 },
  { text: '  location : Kozhikode, Kerala — UTC+5:30', color: '#00cc33', delay: 80, typeSpeed: 22 },
  { text: '  email    : robinkevin648@gmail.com', color: '#00cc33', delay: 80, typeSpeed: 22, pauseAfter: 400 },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', color: '#2a2a3a', delay: 0, typeSpeed: 5 },
  { text: 'Restoring normal mode...', color: '#6b6b7a', delay: 300, typeSpeed: 22, pauseAfter: 800 },
];

function useTypewriter(onAllDone: () => void) {
  const [lines, setLines] = useState<{ text: string; color: string; done: boolean }[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      for (let li = 0; li < SCRIPT.length; li++) {
        if (cancelled) return;
        const cfg = SCRIPT[li];
        await new Promise(r => setTimeout(r, cfg.delay ?? 0));
        if (cancelled) return;

        const color = cfg.color ?? '#00cc33';
        setLines(prev => [...prev, { text: '', color, done: false }]);

        const speed = cfg.typeSpeed ?? 18;
        for (let ci = 0; ci <= cfg.text.length; ci++) {
          if (cancelled) return;
          await new Promise(r => setTimeout(r, speed));
          setLines(prev => {
            const next = [...prev];
            next[li] = { ...next[li], text: cfg.text.slice(0, ci) };
            return next;
          });
        }

        setLines(prev => {
          const next = [...prev];
          next[li] = { ...next[li], done: true };
          return next;
        });
        setProgress(Math.round(((li + 1) / SCRIPT.length) * 100));

        if (cfg.pauseAfter) {
          await new Promise(r => setTimeout(r, cfg.pauseAfter));
        }
      }
      if (!cancelled) onAllDone();
    };

    run();
    return () => { cancelled = true; };
  }, []);

  return { lines, progress };
}

export function TerminalGlitch({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [midGlitch, setMidGlitch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDone = () => {
    setExiting(true);
    setTimeout(() => { setMounted(false); onDone(); }, 1100);
  };

  const { lines, progress } = useTypewriter(handleDone);

  // Auto-scroll to bottom as lines appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Random mid-glitch bursts: 1 or 2 times, never back to back
  useEffect(() => {
    if (exiting) return;
    const totalDuration = SCRIPT.reduce((acc, l) => acc + (l.delay ?? 0) + (l.text.length * (l.typeSpeed ?? 18)) + (l.pauseAfter ?? 0), 0);
    const count = 1 + Math.floor(Math.random() * 2); // 1 or 2
    const MIN_GAP = 5000; // at least 5s between bursts
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Pick times in the 25%-75% window, ensuring MIN_GAP separation
    const first = totalDuration * (0.25 + Math.random() * 0.25); // 25%-50%
    const times = [first];
    if (count === 2) {
      // Second must be at least MIN_GAP after first, within 75%
      const earliest = first + MIN_GAP;
      const latest = totalDuration * 0.75;
      if (earliest < latest) {
        times.push(earliest + Math.random() * (latest - earliest));
      }
    }

    times.forEach(when => {
      timers.push(setTimeout(() => {
        setMidGlitch(true);
        setTimeout(() => setMidGlitch(false), 350);
      }, when));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Lock scroll + strip hash
  useEffect(() => {
    const scrollY = window.scrollY;
    const hash = window.location.hash;
    document.body.style.overflow = 'hidden';
    if (hash) history.replaceState(null, '', window.location.pathname);
    return () => {
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
      if (hash) history.replaceState(null, '', hash);
    };
  }, []);

  const progressBar = (() => {
    const filled = Math.floor(progress / 5);
    return '█'.repeat(filled) + '░'.repeat(20 - filled);
  })();

  const animStyle: React.CSSProperties = exiting
    ? { animation: 'glitch-out 1.1s steps(1) forwards' }
    : midGlitch
    ? { animation: 'glitch-burst 0.35s steps(1) forwards' }
    : { animation: 'glitch-in 1s steps(1) forwards' };

  return (
    <>
      <style>{GLITCH_STYLES}</style>
      <AnimatePresence>
        {mounted ? (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              ...animStyle,
            }}
          >
            {/* Base layer */}
            <div className="absolute inset-0 bg-[#020402] flex flex-col">

              {/* RGB red channel ghost */}
              <div className="pointer-events-none absolute inset-0 bg-[#020402] flex flex-col" style={{
                animation: 'rgb-r 4s steps(1) infinite',
                mixBlendMode: 'screen',
                opacity: 0.15,
                filter: 'url(#red-shift)',
              }} />

              {/* RGB blue channel ghost */}
              <div className="pointer-events-none absolute inset-0 bg-[#020402] flex flex-col" style={{
                animation: 'rgb-b 4s steps(1) infinite',
                mixBlendMode: 'screen',
                opacity: 0.15,
              }} />

              {/* Scanlines */}
              <div className="pointer-events-none absolute inset-0" style={{
                background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,65,0.012) 3px,rgba(0,255,65,0.012) 4px)',
              }} />

              {/* Slice tear overlay */}
              <div className="pointer-events-none absolute inset-0 bg-[#020402]" style={{
                animation: 'slice-tear 6s steps(1) infinite',
                filter: 'brightness(2)',
              }} />

              {/* CRT vignette */}
              <div className="pointer-events-none absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.88) 100%)',
              }} />

              {/* Top bar */}
              <div className="relative flex items-center justify-between px-6 py-3 border-b border-[#0a2a0a]">
                <span style={{ color: '#1a4a1a', fontSize: 11, letterSpacing: '0.2em' }}>KEVINSYLVESTER.XYZ — SYSTEM TERMINAL v2.4.1</span>
                <span style={{ color: '#1a4a1a', fontSize: 11 }}>{new Date().toISOString().slice(0, 19).replace('T', ' ')}</span>
              </div>

              {/* Lines */}
              <div
                ref={scrollRef}
                className="relative flex-1 overflow-y-auto px-6 md:px-12 py-6"
                style={{ scrollbarWidth: 'none' }}
              >
                <div className="max-w-3xl space-y-[3px]">
                  {lines.map((line, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs md:text-sm leading-5">
                      <span style={{ color: '#1a3a1a', userSelect: 'none', flexShrink: 0 }}>
                        {String(i + 1).padStart(3, '0')}
                      </span>
                      <span style={{ color: line.color, whiteSpace: 'pre' }}>
                        {line.text}
                        {!line.done && <span style={{ color: '#00ff41' }} className="caret">▋</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom status bar */}
              <div className="relative px-6 py-3 border-t border-[#0a2a0a] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span style={{ color: '#1a4a1a', fontSize: 11 }}>PROGRESS</span>
                  <span style={{ color: '#00cc33', fontSize: 11, letterSpacing: '0.05em' }}>{progressBar}</span>
                  <span style={{ color: '#00ff41', fontSize: 11 }}>{progress}%</span>
                </div>
                <span style={{ color: '#1a4a1a', fontSize: 11 }}>
                  {lines.length}/{SCRIPT.length} operations
                </span>
              </div>

            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
