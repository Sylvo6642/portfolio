import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionReveal } from '../shared/SectionReveal';
import { FadeText } from '../shared/FadeText';
import { SKILL_GROUPS } from '../../data/skills';
import { SKILL_ICONS } from '../../data/skillIcons';

const SKILL_COLORS: Record<string, string> = {
  Python:       '#0288d1',
  Django:       '#43a047',
  Angular:      '#e53935',
  TypeScript:   '#0288d1',
  JavaScript:   '#ffca28',
  Git:          '#e64a19',
  Bitbucket:    '#0052CC',
  React:        '#00bcd4',
  'Node.js':    '#8bc34a',
  'Express.js': '#ffffff',
  'Next.js':    '#cfd8dc',
  PostgreSQL:   '#4169E1',
  MongoDB:      '#47A248',
  Supabase:     '#66bb6a',
  HTML:         '#e65100',
  CSS:          '#7e57c2',
  Bootstrap:    '#7952B3',
  GitHub:       '#ffffff',
  GitLab:       '#FC6D26',
  Bash:         '#4EAA25',
  n8n:          '#EA4B71',
};

// Flatten all skills into one array with their group label
const ALL_SKILLS = SKILL_GROUPS.flatMap((g) =>
  g.items.map((name) => ({ name, group: g.title }))
);

// Split into 3 rows, cycling through all skills
function chunk(arr: typeof ALL_SKILLS, rows: number) {
  const result: (typeof ALL_SKILLS)[] = Array.from({ length: rows }, () => []);
  arr.forEach((item, i) => result[i % rows].push(item));
  return result;
}

const ROWS = chunk(ALL_SKILLS, 3);

// Duplicate items for seamless loop
function doubled(arr: typeof ALL_SKILLS) {
  return [...arr, ...arr, ...arr];
}

const SPEEDS = ['38s', '45s', '32s'];
const DIRS = ['normal', 'reverse', 'normal'] as const;

function SkillPill({ name, group }: { name: string; group: string }) {
  const icon = SKILL_ICONS[name];
  const color = SKILL_COLORS[name] ?? 'rgb(var(--accent))';
  const label = group === 'Currently Working With' ? 'active' : group === 'Expanding Into' ? 'learning' : 'familiar';

  return (
    <span
      className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium hairline shrink-0 cursor-default select-none"
      style={{
        background: 'rgb(var(--bg) / 0.6)',
        backdropFilter: 'blur(8px)',
        transition: 'background 0.25s, border-color 0.25s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = `${color}18`;
        el.style.borderColor = `${color}55`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgb(var(--bg) / 0.6)';
        el.style.borderColor = '';
      }}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span style={{ color: 'rgb(var(--fg) / 0.85)' }}>{name}</span>
      <span
        className="font-mono text-[9px] tracking-[0.15em] uppercase hidden sm:inline"
        style={{ color: 'rgb(var(--fg) / 0.3)' }}
      >
        {label}
      </span>
    </span>
  );
}

function MarqueeRow({ items, speed, direction, paused }: {
  items: typeof ALL_SKILLS;
  speed: string;
  direction: 'normal' | 'reverse';
  paused: boolean;
}) {
  const list = doubled(items);
  return (
    <div className="relative flex overflow-hidden">
      <div
        className="flex gap-3 items-center"
        style={{
          animation: `marquee ${speed} linear infinite ${direction}`,
          animationPlayState: paused ? 'paused' : 'running',
          willChange: 'transform',
        }}
      >
        {list.map((s, i) => (
          <SkillPill key={`${s.name}-${i}`} name={s.name} group={s.group} />
        ))}
      </div>
    </div>
  );
}

export function Skills() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.1 });

  return (
    <section id="skills" className="relative py-32 hairline-b overflow-hidden">
      {/* keyframes injected once */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>

      {/* Fade edges */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-40"
        style={{ background: 'linear-gradient(to right, rgb(var(--bg)), transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-40"
        style={{ background: 'linear-gradient(to left, rgb(var(--bg)), transparent)' }}
      />

      <div className="mx-auto max-w-6xl px-6 mb-16">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-6">
            02 / skills
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            What I work with.
          </h2>
        </SectionReveal>

        <p className="mt-4 text-base text-fg/50">
          <FadeText text="My stack — from backend logic to delivered pixel." delay={0.2} />
        </p>
      </div>

      {/* Marquee rows */}
      <motion.div
        ref={ref}
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {ROWS.map((row, i) => (
          <MarqueeRow
            key={i}
            items={row}
            speed={SPEEDS[i]}
            direction={DIRS[i]}
            paused={!inView}
          />
        ))}
      </motion.div>

      {/* Legend */}
      <div className="mx-auto max-w-6xl px-6 mt-14">
        <SectionReveal delay={0.2}>
          <div className="flex flex-wrap gap-6 font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
            <span>● active — currently using</span>
            <span>● learning — expanding into</span>
            <span>● familiar — worked with before</span>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
