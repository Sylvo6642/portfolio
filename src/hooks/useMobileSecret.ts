import { useEffect, useCallback, useRef } from 'react';

const TAPS_REQUIRED = 5;
const TIMEOUT_MS = 3000;

export function useMobileSecret(onActivate: () => void) {
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const armed = useRef(false);

  const reset = () => {
    count.current = 0;
    armed.current = false;
    timer.current = null;
    document.dispatchEvent(new CustomEvent('secret:disarm'));
  };

  const bumpTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(reset, TIMEOUT_MS);
  }, []);

  // Logo tap — arms the sequence
  useEffect(() => {
    const onLogo = () => {
      if (armed.current) return;
      armed.current = true;
      count.current = 1;
      document.dispatchEvent(new CustomEvent('secret:arm'));
      bumpTimer();
    };
    document.addEventListener('secret:logo-tap', onLogo);
    return () => document.removeEventListener('secret:logo-tap', onLogo);
  }, [bumpTimer]);

  // Screen taps — count down while armed
  useEffect(() => {
    const onScreen = (e: TouchEvent) => {
      if (!armed.current) return;
      // Ignore taps on the logo itself (already counted as tap 1)
      const target = e.target as HTMLElement;
      if (target.closest('[data-secret-logo]')) return;

      count.current++;
      bumpTimer();

      if (count.current >= TAPS_REQUIRED) {
        if (timer.current) clearTimeout(timer.current);
        reset();
        onActivate();
      }
    };

    window.addEventListener('touchstart', onScreen, { passive: true });
    return () => window.removeEventListener('touchstart', onScreen);
  }, [bumpTimer, onActivate]);
}
