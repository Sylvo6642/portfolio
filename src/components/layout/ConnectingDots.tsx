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
  distance: number;
  dRadius: number;
}

function tierForWidth(w: number): Tier {
  if (w > 1600) return { nb: 600, distance: 70, dRadius: 300 };
  if (w > 1300) return { nb: 525, distance: 60, dRadius: 280 };
  if (w > 1100) return { nb: 450, distance: 55, dRadius: 250 };
  if (w > 800) return { nb: 280, distance: 50, dRadius: 220 };
  if (w > 600) return { nb: 180, distance: 45, dRadius: 180 };
  return { nb: 110, distance: 40, dRadius: 150 };
}

function readAccent(): { r: number; g: number; b: number } {
  // Read --accent (e.g. "124 58 237") off :root so the canvas matches the live theme
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const [r, g, b] = raw.split(/\s+/).map((n) => parseInt(n, 10));
  if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) return { r, g, b };
  return { r: 124, g: 58, b: 237 };
}

export function ConnectingDots({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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
    let visible = true;
    let mouseX = cssW / 2;
    let mouseY = cssH / 2;
    let accent = readAccent();
    let accentMix = { r: 128, g: 126, b: 120 }; // neutral gray secondary, ~15% of dots

    const resize = () => {
      const nextW = wrap.clientWidth;
      const nextH = wrap.clientHeight;
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      // Assigning canvas.width clears its bitmap. Mobile toolbar resize events
      // used to clear/reseed every canvas even when its actual size was unchanged.
      if (dots.length > 0 && canvas.width === Math.floor(nextW * nextDpr) && canvas.height === Math.floor(nextH * nextDpr) && dpr === nextDpr) return;
      cssW = nextW;
      cssH = nextH;
      dpr = nextDpr;
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
          vx: -0.4 + Math.random() * 0.8,
          vy: -0.4 + Math.random() * 0.8,
          radius: Math.random() * 1.5 + 0.2,
          color: `${c.r},${c.g},${c.b}`,
        };
      }
      // Dot 0 follows the mouse — bigger and always accent
      dots[0].radius = 1.8;
      dots[0].color = `${accent.r},${accent.g},${accent.b}`;
    };

    const fadeBy = Math.max(cssW, cssH) / 1.7;

    const tick = () => {
      ctx.clearRect(0, 0, cssW, cssH);

      // Update positions (skip dot 0, it tracks the mouse)
      for (let i = 1; i < dots.length; i++) {
        const d = dots[i];
        if (d.x < 0 || d.x > cssW) d.vx = -d.vx;
        if (d.y < 0 || d.y > cssH) d.vy = -d.vy;
        d.x += d.vx;
        d.y += d.vy;
      }
      dots[0].x = mouseX;
      dots[0].y = mouseY;

      // Lines (only when within mouse zone, only when distance threshold > 0)
      if (tier.distance > 0) {
        ctx.lineWidth = 0.4;
        for (let i = 0; i < dots.length; i++) {
          const a = dots[i];
          const dxm = a.x - mouseX;
          const dym = a.y - mouseY;
          if (
            dxm > tier.dRadius ||
            dxm < -tier.dRadius ||
            dym > tier.dRadius ||
            dym < -tier.dRadius
          ) {
            continue;
          }
          for (let j = i + 1; j < dots.length; j++) {
            const b = dots[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            if (dx > tier.distance || dx < -tier.distance) continue;
            if (dy > tier.distance || dy < -tier.distance) continue;

            const dotDist = Math.sqrt(dxm * dxm + dym * dym);
            let ratio = dotDist / tier.dRadius - 0.3;
            if (ratio < 0) ratio = 0;
            const alpha = 1 - ratio;

            ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${alpha * 0.55})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dx = d.x - mouseX;
        const dy = d.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ratio = Math.min(1, dist / fadeBy);
        ctx.fillStyle = `rgba(${d.color}, ${1 - ratio})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };

    let lastClientX = -1;
    let lastClientY = -1;

    const updateFromClient = () => {
      if (lastClientX < 0) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = lastClientX - rect.left;
      mouseY = lastClientY - rect.top;
    };

    const onMove = (e: MouseEvent) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      updateFromClient();
    };

    const onScroll = () => updateFromClient();

    // Gyroscope for coarse-pointer (mobile) devices
    // gamma: left/right tilt (-90..90), beta: front/back tilt (-180..180)
    const GYRO_RANGE_X = 30; // degrees of gamma mapped to full width
    const GYRO_RANGE_Y = 40; // degrees of beta mapped to full height
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      const gx = Math.max(-GYRO_RANGE_X, Math.min(GYRO_RANGE_X, e.gamma));
      const gy = Math.max(-GYRO_RANGE_Y, Math.min(GYRO_RANGE_Y, e.beta - 45)); // 45° is natural hold angle
      mouseX = cssW * (gx / (GYRO_RANGE_X * 2) + 0.5);
      mouseY = cssH * (gy / (GYRO_RANGE_Y * 2) + 0.5);
    };

    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    const attachGyro = () => {
      window.addEventListener('deviceorientation', onOrient);
    };

    if (isCoarse) {
      // iOS 13+ requires permission; Android grants automatically
      const DevOri = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof DevOri?.requestPermission === 'function') {
        DevOri.requestPermission()
          .then((state: string) => { if (state === 'granted') attachGyro(); })
          .catch(() => {});
      } else {
        attachGyro();
      }
    }

    const resume = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) tick();
    };
    resize();
    resume();
    const sizeObserver = new ResizeObserver(() => {
      resize();
      resume();
    });
    sizeObserver.observe(wrap);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    visibilityObserver.observe(wrap);
    document.addEventListener('visibilitychange', resume);

    if (reduced) {
      // Resize/theme changes can still repaint this static texture.
      tick();
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Re-read accent if theme toggles (HTML class change → recompute on next resize)
    const themeObserver = new MutationObserver(() => {
      const previous = `${accent.r},${accent.g},${accent.b}`;
      accent = readAccent();
      for (const dot of dots) {
        if (dot.color === previous) dot.color = `${accent.r},${accent.g},${accent.b}`;
      }
      resume();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelAnimationFrame(raf);
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('deviceorientation', onOrient);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
