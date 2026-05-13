import { useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from '../../theme/ThemeProvider';

type TransitionVariant = 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'rectangle' | 'star';

const VARIANT: TransitionVariant = 'circle';
const DURATION = 600;

function polygonCollapsed(cx: number, cy: number, n: number) {
  return `polygon(${Array.from({ length: n }, () => `${cx}px ${cy}px`).join(', ')})`;
}

function getClipPaths(
  variant: TransitionVariant,
  cx: number, cy: number,
  maxRadius: number,
  vw: number, vh: number,
): [string, string] {
  switch (variant) {
    case 'circle':
      return [`circle(0px at ${cx}px ${cy}px)`, `circle(${maxRadius}px at ${cx}px ${cy}px)`];
    case 'square': {
      const h = Math.max(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) * 1.05;
      const end = `${cx-h}px ${cy-h}px, ${cx+h}px ${cy-h}px, ${cx+h}px ${cy+h}px, ${cx-h}px ${cy+h}px`;
      return [polygonCollapsed(cx, cy, 4), `polygon(${end})`];
    }
    case 'triangle': {
      const s = maxRadius * 2.2;
      const dx = (Math.sqrt(3) / 2) * s;
      const verts = `${cx}px ${cy-s}px, ${cx+dx}px ${cy+0.5*s}px, ${cx-dx}px ${cy+0.5*s}px`;
      return [polygonCollapsed(cx, cy, 3), `polygon(${verts})`];
    }
    case 'diamond': {
      const R = maxRadius * Math.SQRT2;
      const end = `${cx}px ${cy-R}px, ${cx+R}px ${cy}px, ${cx}px ${cy+R}px, ${cx-R}px ${cy}px`;
      return [polygonCollapsed(cx, cy, 4), `polygon(${end})`];
    }
    case 'hexagon': {
      const R = maxRadius * Math.SQRT2;
      const verts = Array.from({ length: 6 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        return `${cx + R * Math.cos(a)}px ${cy + R * Math.sin(a)}px`;
      }).join(', ');
      return [polygonCollapsed(cx, cy, 6), `polygon(${verts})`];
    }
    case 'rectangle': {
      const hw = Math.max(cx, vw - cx);
      const hh = Math.max(cy, vh - cy);
      const end = `${cx-hw}px ${cy-hh}px, ${cx+hw}px ${cy-hh}px, ${cx+hw}px ${cy+hh}px, ${cx-hw}px ${cy+hh}px`;
      return [polygonCollapsed(cx, cy, 4), `polygon(${end})`];
    }
    case 'star': {
      const R = maxRadius * Math.SQRT2 * 1.03;
      const inner = 0.42;
      const star = (r: number) => {
        const pts: string[] = [];
        for (let i = 0; i < 5; i++) {
          const oa = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          pts.push(`${cx + r * Math.cos(oa)}px ${cy + r * Math.sin(oa)}px`);
          const ia = oa + Math.PI / 5;
          pts.push(`${cx + r * inner * Math.cos(ia)}px ${cy + r * inner * Math.sin(ia)}px`);
        }
        return `polygon(${pts.join(', ')})`;
      };
      return [star(Math.max(2, R * 0.025)), star(R)];
    }
  }
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    const button = buttonRef.current;
    if (!button) { toggle(); return; }

    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const { top, left, width, height } = button.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top + height / 2;
    const maxRadius = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy));

    if (typeof document.startViewTransition !== 'function') {
      toggle();
      return;
    }

    const [clipFrom, clipTo] = getClipPaths(VARIANT, cx, cy, maxRadius, vw, vh);
    const root = document.documentElement;
    root.dataset.magicuiThemeVt = 'active';
    root.style.setProperty('--magicui-theme-toggle-vt-duration', `${DURATION}ms`);
    root.style.setProperty('--magicui-theme-vt-clip-from', clipFrom);

    const cleanup = () => {
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
      root.style.removeProperty('--magicui-theme-vt-clip-from');
    };

    const transition = document.startViewTransition(() => { flushSync(toggle); });
    transition.finished.finally(cleanup);
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [clipFrom, clipTo] },
        { duration: DURATION, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards', pseudoElement: '::view-transition-new(root)' },
      );
    });
  }, [toggle]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={handleClick}
      data-cursor="hover"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative h-9 w-9 rounded-full hairline grid place-items-center overflow-hidden hover:bg-fg/5 transition-colors"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
