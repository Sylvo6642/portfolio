import { useEffect, useState } from 'react';

export function useTypewriter(text: string, speedMs = 80, startDelayMs = 200) {
  const [out, setOut] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setOut(text);
      setDone(true);
      return;
    }
    setOut('');
    setDone(false);
    let i = 0;
    let timeoutId: number | undefined;
    const start = window.setTimeout(() => {
      const tick = () => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length) {
          setDone(true);
          return;
        }
        timeoutId = window.setTimeout(tick, speedMs);
      };
      tick();
    }, startDelayMs);
    return () => {
      window.clearTimeout(start);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [text, speedMs, startDelayMs]);

  return { text: out, done };
}

interface SequenceOptions {
  typeMs?: number;
  eraseMs?: number;
  holdMs?: number;
  finalHoldMs?: number;
  startDelayMs?: number;
}

/**
 * Types through a sequence of phrases. Between adjacent phrases we only erase
 * back to their longest shared prefix (so "Hi, I'm Kevin Robin" → "Hi, I'm A
 * Backend Engineer" erases just the tail). The last phrase is held forever.
 */
export function useTypewriterSequence(phrases: string[], opts: SequenceOptions = {}) {
  const {
    typeMs = 75,
    eraseMs = 35,
    holdMs = 1400,
    finalHoldMs = Infinity,
    startDelayMs = 250,
  } = opts;

  const [out, setOut] = useState('');
  const [doneAll, setDoneAll] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setOut(phrases[phrases.length - 1]);
      setDoneAll(true);
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeoutId = window.setTimeout(() => resolve(), ms);
      });

    const sharedPrefixLength = (a: string, b: string) => {
      const n = Math.min(a.length, b.length);
      let i = 0;
      while (i < n && a[i] === b[i]) i++;
      return i;
    };

    const typeFrom = async (current: string, target: string) => {
      for (let i = current.length + 1; i <= target.length; i++) {
        if (cancelled) return;
        setOut(target.slice(0, i));
        await wait(typeMs);
      }
    };

    const eraseTo = async (current: string, keep: number) => {
      for (let i = current.length - 1; i >= keep; i--) {
        if (cancelled) return;
        setOut(current.slice(0, i));
        await wait(eraseMs);
      }
    };

    const run = async () => {
      await wait(startDelayMs);
      if (cancelled) return;

      let current = '';
      for (let p = 0; p < phrases.length; p++) {
        const target = phrases[p];
        const isLast = p === phrases.length - 1;

        const keep = sharedPrefixLength(current, target);
        if (current.length > keep) {
          await eraseTo(current, keep);
          if (cancelled) return;
          current = current.slice(0, keep);
        }

        await typeFrom(current, target);
        if (cancelled) return;
        current = target;

        const hold = isLast ? finalHoldMs : holdMs;
        if (hold === Infinity) {
          setDoneAll(true);
          return;
        }
        await wait(hold);
        if (cancelled) return;
      }
      // Loop back from phrase index 0 indefinitely
      let loopCurrent = phrases[phrases.length - 1];
      let loopIdx = 0;
      while (!cancelled) {
        const target = phrases[loopIdx % phrases.length];
        loopIdx++;
        const keep = sharedPrefixLength(loopCurrent, target);
        if (loopCurrent.length > keep) {
          await eraseTo(loopCurrent, keep);
          if (cancelled) return;
          loopCurrent = loopCurrent.slice(0, keep);
        }
        await typeFrom(loopCurrent, target);
        if (cancelled) return;
        loopCurrent = target;
        await wait(holdMs);
        if (cancelled) return;
      }
    };

    void run();
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [phrases, typeMs, eraseMs, holdMs, finalHoldMs, startDelayMs]);

  return { text: out, done: doneAll };
}
