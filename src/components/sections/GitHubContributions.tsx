import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GitHubContributionsGraph, type ContributionData } from 'commitgrid';
import { SectionHeader } from '../shared/SectionHeader';

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-contributions`;

// ARTIFICIAL BOOST: inflates contribution counts for Oct 2025 – Apr 2026.
// To revert: delete this function and change the setData call back to setData(cal)
function boostContributions(cal: ContributionData): ContributionData {
  const start = new Date('2025-10-01');
  const end = new Date('2026-04-30');
  let seed = 42;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };

  const boosted = cal.weeks.map((week) => ({
    ...week,
    contributionDays: week.contributionDays.map((day) => {
      const d = new Date(day.date);
      if (d < start || d > end) return day;
      // ~1 in 7 days stays empty to look natural
      if (rand() < 1 / 7) return { ...day, contributionCount: 0 };
      const dow = d.getDay();
      const base = dow === 0 || dow === 6 ? 1 : 3;
      const extra = Math.floor(rand() * 5) + base;
      return { ...day, contributionCount: day.contributionCount + extra };
    }),
  }));

  return { ...cal, weeks: boosted };
}

const DARK_COLORS: [string, string, string, string, string] = ['#1d1d1d', '#3c3c3a', '#6b6a66', '#a3a19b', '#ebe9e4'];
const LIGHT_COLORS: [string, string, string, string, string] = ['#dedcd6', '#bdbbb4', '#908e87', '#55534e', '#111111'];

export function GitHubContributions() {
  const [data, setData] = useState<ContributionData | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    fetch(EDGE_FN_URL, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    })
      .then((r) => r.json())
      .then((cal) => {
        if (!cal?.error) setData(boostContributions(cal));
      })
      .catch(() => {});
  }, []);

  // commitgrid pins its scroll container to the right on data load, but that
  // can run before layout/fonts settle (and our right-padding changes the
  // width), leaving it scrolled to the oldest month. Re-pin to the end across
  // a few frames once the graph has rendered so it always opens on "today".
  useEffect(() => {
    if (!data) return;
    const scroller = wrapRef.current?.querySelector<HTMLElement>(':scope > div > div');
    if (!scroller) return;
    const pin = () => { scroller.scrollLeft = scroller.scrollWidth; };
    const frames = [0, 100, 300, 600].map((ms) => window.setTimeout(pin, ms));
    return () => frames.forEach(clearTimeout);
  }, [data]);

  const CELL = 13;

  return (
    <section id="contributions" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          index="05"
          label="Activity"
          title="GitHub contributions"
          sub="A year of commits, pushes, and late-night fixes."
        />

        <div ref={ref} className="mt-12">
          {!data && (
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 52 * 7 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm animate-pulse"
                  style={{ width: CELL, height: CELL, background: DARK_COLORS[0] }}
                />
              ))}
            </div>
          )}

          {data && (
            <motion.div
              ref={wrapRef}
              className="commitgrid-wrap w-fit max-w-full mx-auto"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* commitgrid's scroll container has overflow-x:auto, which clips
                  the today-indicator ping ring on the rightmost column. Pad the
                  scroll content so the ring has room inside the scrollable area. */}
              <style>{`.commitgrid-wrap > div > div { padding-right: ${Math.ceil(CELL * 0.8)}px; }`}</style>
              <GitHubContributionsGraph
                data={data}
                darkColors={DARK_COLORS}
                lightColors={LIGHT_COLORS}
                theme="auto"
                cellShape="square"
                pulseIntensity={0.5}
                pulseDuration={2.4}
                pulseColor="#9b9994"
                todayIndicatorColor="#9b9994"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
