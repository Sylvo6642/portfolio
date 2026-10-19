import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GitHubContributionsGraph, type ContributionData } from 'commitgrid';
import { SectionHeader } from '../shared/SectionHeader';

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-contributions`;

// Walnut ramps from the site palette, empty day → busiest day
const DARK_COLORS: [string, string, string, string, string] = ['#2A2019', '#4A3424', '#7A5232', '#B9803F', '#E8B887'];
const LIGHT_COLORS: [string, string, string, string, string] = ['#EFE6DB', '#E2C8A6', '#C99766', '#9A6337', '#5E361C'];

export function GitHubContributions() {
  const [data, setData] = useState<ContributionData | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  // The busiest days glow on a loop; only run it while the graph is on screen
  const onScreen = useInView(ref);

  useEffect(() => {
    fetch(EDGE_FN_URL, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    })
      .then((r) => r.json())
      .then((cal) => {
        if (!cal?.error) setData(cal);
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
            // One pulse for the whole placeholder rather than one per cell
            <div className="flex gap-1 flex-wrap animate-pulse">
              {Array.from({ length: 52 * 7 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm"
                  style={{ width: CELL, height: CELL, background: 'rgb(var(--edge))' }}
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
                pulseHighActivity={onScreen}
                pulseIntensity={0.5}
                pulseDuration={2.4}
                pulseColor="#B9803F"
                todayIndicatorColor="#B9803F"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
