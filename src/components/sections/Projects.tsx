import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from 'framer-motion';
import { useState } from 'react';
import { useMobileLayout } from '../../hooks/useMobileLayout';
import { SectionReveal } from '../shared/SectionReveal';
import { SectionHeader } from '../shared/SectionHeader';
import { VideoModal } from '../shared/VideoModal';
import { PERSONAL_PROJECTS, PROFESSIONAL_CARDS, type PersonalProject, type ProjectStatus } from '../../data/projects';

const STATUS: Record<ProjectStatus, { label: string; className: string }> = {
  live: { label: 'Live', className: 'text-[#2f8f5b] dark:text-[#4fbf85]' },
  wip: { label: 'In development', className: 'text-[#b7791f] dark:text-[#e0a54a]' },
  private: { label: 'Private', className: 'text-muted' },
};

function StatusDot({ status, className = '' }: { status: ProjectStatus; className?: string }) {
  const s = STATUS[status];
  return (
    <span className={`items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase whitespace-nowrap ${s.className} ${className}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

function ArrowUpRight() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

function PersonalProjectRow({ p, i, onVideoOpen }: { p: PersonalProject; i: number; onVideoOpen: (p: PersonalProject) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="hairline-t"
    >
      {/* Collapsed row: useful on its own, so the summary and status live here */}
      <button
        onClick={() => setOpen((o) => !o)}
        data-cursor="hover"
        aria-expanded={open}
        className="group w-full text-left grid grid-cols-[auto_minmax(0,1fr)_auto] md:grid-cols-[48px_minmax(0,1fr)_auto_auto] items-center gap-x-4 md:gap-x-6 px-1 md:px-2 py-5 md:py-7 transition-colors duration-300 md:hover:bg-fg/[0.025]"
      >
        <span className="self-start pt-2 md:pt-3 font-mono text-[10px] md:text-xs tracking-[0.15em] text-muted">
          {String(i + 1).padStart(2, '0')}
        </span>

        <span className="min-w-0">
          <span className="block display-type text-2xl md:text-4xl truncate">{p.name}</span>
          <span className="mt-1.5 block text-sm text-fg/65 leading-snug">{p.summary}</span>
          <StatusDot status={p.status} className="mt-2.5 inline-flex md:hidden" />
        </span>

        <StatusDot status={p.status} className="hidden md:inline-flex" />

        <span className="grid h-8 w-8 md:h-9 md:w-9 place-items-center rounded-full hairline transition-colors duration-300 group-hover:border-fg/40">
          <motion.svg
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden
          >
            <path d="M12 5v14M5 12h14" />
          </motion.svg>
        </span>
      </button>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {/* Phone: one column (preview, highlights, stack, links).
                Desktop: highlights + links on the left, preview + stack on the right. */}
            <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:gap-10 px-1 md:px-2 md:pl-[72px] pb-8 md:pb-10">
              <div className="contents md:flex md:flex-col md:gap-7">
                <ul className="order-2 md:order-none grid gap-2.5">
                  {p.highlights.map((h) => (
                    <li key={h} className="relative pl-5 text-sm md:text-[15px] leading-relaxed text-fg/80">
                      <span aria-hidden className="absolute left-0 top-[0.75em] h-px w-2.5 bg-fg/50" />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="order-4 md:order-none flex flex-wrap items-center gap-x-6 gap-y-3">
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      className="inline-flex items-center gap-1.5 pb-0.5 border-b border-fg text-sm font-medium hover:opacity-70 transition-opacity"
                    >
                      View project <ArrowUpRight />
                    </a>
                  )}
                  {p.link ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      className="inline-flex items-center gap-1.5 pb-0.5 border-b border-fg/25 text-sm font-medium hover:border-fg transition-colors"
                    >
                      {p.linkLabel}
                    </a>
                  ) : (
                    <span className="text-sm text-muted">Source private</span>
                  )}
                </div>
              </div>

              <div className="contents md:flex md:flex-col md:gap-5">
                {p.video && (
                  <button
                    type="button"
                    onClick={() => onVideoOpen(p)}
                    data-cursor="hover"
                    aria-label={`Watch the ${p.name} demo`}
                    className="group/media order-1 md:order-none relative aspect-[16/10] overflow-hidden rounded-[10px] hairline bg-fg/[0.04]"
                  >
                    {p.poster && (
                      <img src={p.poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <span className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-bg px-3.5 py-2 hairline font-mono text-[11px] uppercase tracking-[0.12em] transition-transform duration-300 group-hover/media:scale-105">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                        Watch demo
                      </span>
                    </span>
                  </button>
                )}

                <div className="order-3 md:order-none">
                  <span className="block mb-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-muted">Stack</span>
                  <p className="font-mono text-[11px] md:text-xs leading-relaxed text-muted">{p.tech.join(' · ')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Projects() {
  const [active, setActive] = useState<PersonalProject | null>(null);
  const reduced = useReducedMotion();
  const mobile = useMobileLayout();

  // Elastic skew: fast scrolling shears the project list, springing back on stop
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const skewY = useTransform(smoothVelocity, [-1500, 0, 1500], [-2.5, 0, 2.5]);

  return (
    <section id="projects" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          index="04"
          label="Projects"
          title="Things I've built"
          sub="Side projects, client work, and everything in between."
        />

        {/* Personal projects — accordion rows */}
        <SectionReveal delay={0.15}>
          <h3 className="mt-16 mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-muted">
            ↳ Personal Projects
          </h3>
        </SectionReveal>

        <motion.div
          className="flex flex-col hairline-b"
          style={reduced || mobile ? undefined : { skewY }}
        >
          {PERSONAL_PROJECTS.map((p, i) => (
            <PersonalProjectRow key={p.name} p={p} i={i} onVideoOpen={setActive} />
          ))}
        </motion.div>

        {/* Professional work */}
        <SectionReveal delay={0.1}>
          <h3 className="mt-20 mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-muted">
            ↳ What I Build (Professional)
          </h3>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10 hairline-t">
          {PROFESSIONAL_CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 gap-y-1.5 px-1 md:px-2 py-5 md:py-7 hairline-b"
            >
              <span className="row-span-2 pt-1 font-mono text-[10px] md:text-xs tracking-[0.15em] text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h4 className="text-base md:text-lg font-bold tracking-tight">{c.title}</h4>
              <p className="text-sm text-fg/65 leading-relaxed">{c.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <VideoModal
        src={active?.video ?? ''}
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.name ?? ''}
      />
    </section>
  );
}
