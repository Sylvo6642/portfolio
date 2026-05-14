import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GitHubContributionsGraph, type ContributionData } from 'commitgrid';
import { SectionReveal } from '../shared/SectionReveal';
import { FadeText } from '../shared/FadeText';

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-contributions`;

const DARK_COLORS: [string, string, string, string, string] = ['#1a1025', '#2d1a4a', '#4a1fa8', '#7c3aed', '#a855f7'];
const LIGHT_COLORS: [string, string, string, string, string] = ['#ede9fe', '#c4b5fd', '#a78bfa', '#7c3aed', '#5b21b6'];

export function GitHubContributions() {
  const [data, setData] = useState<ContributionData | null>(null);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    fetch(EDGE_FN_URL)
      .then((r) => r.json())
      .then((cal) => {
        if (cal?.error) { setError(true); return; }
        setData(cal);
      })
      .catch(() => setError(true));
  }, []);

  const CELL = 13;

  return (
    <section id="contributions" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-6">
            05 / activity
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            GitHub contributions.
          </h2>
        </SectionReveal>

        <p className="mt-4 text-base text-fg/50">
          <FadeText text="A year of commits, pushes, and late-night fixes." delay={0.2} />
        </p>

        <div ref={ref} className="mt-12">
          {error && (
            <p className="text-muted text-sm">Could not load contribution data.</p>
          )}

          {!data && !error && (
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
            <>
              <motion.p
                className="text-sm text-muted mb-4"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <span className="text-fg font-semibold">{data.totalContributions.toLocaleString()}</span>{' '}
                contributions in the last year
              </motion.p>

              <GitHubContributionsGraph
                data={data}
                darkColors={DARK_COLORS}
                lightColors={LIGHT_COLORS}
                theme="auto"
                showTotal={false}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
