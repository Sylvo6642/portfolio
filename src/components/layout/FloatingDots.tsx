import { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Tier {
  nb: number;
}

function tierForWidth(w: number): Tier {
  if (w > 1600) return { nb: 320 };
  if (w > 1300) return { nb: 260 };
  if (w > 1100) return { nb: 220 };
  if (w > 800) return { nb: 160 };
  if (w > 600) return { nb: 110 };
  return { nb: 70 };
}

function readAccent(): { r: number; g: number; b: number } {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const [r, g, b] = raw.split(/\s+/).map((n) => parseInt(n, 10));
  if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) return { r, g, b };
  return { r: 124, g: 58, b: 237 };
}

export function FloatingDots({ className = '', hideOverSelector }: { className?: string; hideOverSelector?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hideOverSelector) return;
    const target = document.querySelector(hideOverSelector);
    const wrap = wrapRef.current;
    if (!target || !wrap) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        wrap.style.opacity = entry.isIntersecting ? '0' : '1';
      },
      { threshold: 0.05 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [hideOverSelector]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssW = wrap.clientWidth;
    let cssH = wrap.clientHeight;
    let tier = tierForWidth(window.innerWidth);
    let dots: Dot[] = [];
    let raf = 0;
    let accent = readAccent();
    const accentMix = { r: 128, g: 126, b: 120 };

    const resize = () => {
      cssW = wrap.clientWidth;
      cssH = wrap.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tier = tierForWidth(window.innerWidth);
      accent = readAccent();
      initDots();
    };

    const initDots = () => {
      dots = new Array(tier.nb);
      for (let i = 0; i < tier.nb; i++) {
        const usePink = Math.random() < 0.15;
        const c = usePink ? accentMix : accent;
        dots[i] = {
          x: Math.random() * cssW,
          y: Math.random() * cssH,
          vx: -0.25 + Math.random() * 0.5,
          vy: -0.25 + Math.random() * 0.5,
          radius: Math.random() * 1.4 + 0.3,
          color: `${c.r},${c.g},${c.b}`,
        };
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, cssW, cssH);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        if (d.x < 0 || d.x > cssW) d.vx = -d.vx;
        if (d.y < 0 || d.y > cssH) d.vy = -d.vy;
        d.x += d.vx;
        d.y += d.vy;

        ctx.fillStyle = `rgba(${d.color}, 0.55)`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    if (!reduced) {
      raf = requestAnimationFrame(tick);
    } else {
      tick();
      cancelAnimationFrame(raf);
    }

    window.addEventListener('resize', resize);

    const themeObserver = new MutationObserver(() => {
      accent = readAccent();
      initDots();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none fixed inset-0 overflow-hidden transition-opacity duration-500 ${className}`}
      style={{ zIndex: 0 }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
