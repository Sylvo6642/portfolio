import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionReveal } from '../shared/SectionReveal';
import { FadeText } from '../shared/FadeText';

const GITHUB_USERNAME = 'Sylvo6642';
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string;

interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface ContributionData {
  totalContributions: number;
  weeks: Week[];
}

const QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }
`;

// Purple scale matching --accent: 124 58 237 (dark) / 167 139 250 (light)
const DARK_COLORS  = ['#1a1025', '#2d1a4a', '#4a1fa8', '#7c3aed', '#a855f7'];
const LIGHT_COLORS = ['#ede9fe', '#c4b5fd', '#a78bfa', '#7c3aed', '#5b21b6'];

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['','Mon','','Wed','','Fri',''];

function getMonthPositions(weeks: Week[]): { label: string; col: number }[] {
  const positions: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date).getMonth();
    if (month !== lastMonth) {
      positions.push({ label: MONTH_LABELS[month], col });
      lastMonth = month;
    }
  });
  return positions;
}

export function GitHubContributions() {
  const [data, setData] = useState<ContributionData | null>(null);
  const [error, setError] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);

    fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          login: GITHUB_USERNAME,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
        if (!cal) { setError(true); return; }
        setData(cal);
      })
      .catch(() => setError(true));
  }, []);

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const CELL = 13; // px per cell
  const GAP = 3;   // px gap

  const weeks = data?.weeks ?? [];
  const monthPositions = getMonthPositions(weeks);

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
                  style={{ width: CELL, height: CELL, background: COLORS[0] }}
                />
              ))}
            </div>
          )}

          {data && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Total count */}
              <p className="text-sm text-muted mb-4">
                <span className="text-fg font-semibold">{data.totalContributions.toLocaleString()}</span>{' '}
                contributions in the last year
              </p>

              {/* Graph container — horizontal scroll on small screens */}
              <div className="overflow-x-auto pb-2">
                {/* Day-of-week label width + gap before grid */}
                {(() => {
                  const DAY_COL_W = 28; // px reserved for Mon/Wed/Fri labels
                  const gridW = weeks.length * (CELL + GAP) - GAP;
                  return (
                    <div style={{ minWidth: DAY_COL_W + gridW }}>
                      {/* Month labels — absolutely positioned over the grid */}
                      <div className="relative" style={{ height: 16, marginLeft: DAY_COL_W }}>
                        {monthPositions.map(({ label, col }) => (
                          <span
                            key={`${label}-${col}`}
                            className="font-mono text-[10px] text-muted select-none absolute"
                            style={{ left: col * (CELL + GAP) }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>

                      {/* Day labels + grid */}
                      <div className="flex" style={{ gap: 0 }}>
                        {/* Day-of-week labels */}
                        <div
                          className="flex flex-col"
                          style={{ gap: GAP, paddingTop: 1, width: DAY_COL_W, flexShrink: 0 }}
                        >
                          {DAY_LABELS.map((d, i) => (
                            <span
                              key={i}
                              className="font-mono text-[10px] text-muted select-none"
                              style={{ height: CELL, lineHeight: `${CELL}px`, display: 'block' }}
                            >
                              {d}
                            </span>
                          ))}
                        </div>

                        {/* Week columns */}
                        <div className="flex" style={{ gap: GAP }}>
                          {weeks.map((week, wIdx) => (
                            <div key={wIdx} className="flex flex-col" style={{ gap: GAP }}>
                              {week.contributionDays.map((day) => {
                                const level = getLevel(day.contributionCount);
                                const color = COLORS[level];
                                return (
                                  <motion.div
                                    key={day.date}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                                    transition={{
                                      duration: 0.3,
                                      delay: 0.3 + wIdx * 0.008,
                                    }}
                                    title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''}`}
                                    className="rounded-sm cursor-default"
                                    style={{
                                      width: CELL,
                                      height: CELL,
                                      background: color,
                                      border: '1px solid rgba(27,31,35,0.06)',
                                      flexShrink: 0,
                                    }}
                                  />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-[3px] mt-3" style={{ marginLeft: DAY_COL_W }}>
                        <span className="font-mono text-[10px] text-muted mr-1 select-none">Less</span>
                        {COLORS.map((c, i) => (
                          <div
                            key={i}
                            className="rounded-sm"
                            style={{ width: CELL, height: CELL, background: c }}
                          />
                        ))}
                        <span className="font-mono text-[10px] text-muted ml-1 select-none">More</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
