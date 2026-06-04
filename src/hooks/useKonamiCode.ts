import { useEffect, useCallback } from 'react';

const SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export function useKonamiCode(onActivate: () => void) {
  const pos = { current: 0 };

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === SEQUENCE[pos.current]) {
      pos.current++;
      if (pos.current === SEQUENCE.length) {
        pos.current = 0;
        onActivate();
      }
    } else {
      pos.current = e.key === SEQUENCE[0] ? 1 : 0;
    }
  }, [onActivate]);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);
}
