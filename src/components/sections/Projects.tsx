import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { SectionReveal } from '../shared/SectionReveal';
import { FadeText } from '../shared/FadeText';
import { TiltCard } from '../shared/TiltCard';
import { VideoModal } from '../shared/VideoModal';
import { PERSONAL_PROJECTS, PROFESSIONAL_CARDS, type PersonalProject } from '../../data/projects';

// Floating icon configs per project (kept as decoration in expanded state)
const SKILLDASH_ICONS = {
  hammer: [
    { top: '10%', left: '6%',  rot: -20, size: 12, opacity: 0.26, dur: 6.4, delay: 0.2 },
    { top: '70%', left: '4%',  rot:  18, size: 10, opacity: 0.22, dur: 7.6, delay: 1.4 },
    { top: '40%', left: '85%', rot: -12, size: 11, opacity: 0.24, dur: 6.9, delay: 0.8 },
    { top: '88%', left: '70%', rot:  30, size: 9,  opacity: 0.20, dur: 8.2, delay: 2.3 },
  ],
  wrench: [
    { top: '22%', left: '22%', rot:  10, size: 11, opacity: 0.22, dur: 7.1, delay: 0.5 },
    { top: '60%', left: '38%', rot: -25, size: 10, opacity: 0.20, dur: 8.5, delay: 1.9 },
    { top: '15%', left: '60%', rot:  28, size: 12, opacity: 0.24, dur: 6.7, delay: 2.6 },
    { top: '78%', left: '52%', rot: -15, size: 9,  opacity: 0.20, dur: 7.9, delay: 0.9 },
    { top: '48%', left: '12%', rot:  35, size: 10, opacity: 0.21, dur: 8.0, delay: 3.2 },
  ],
  utensil: [
    { top: '8%',  left: '38%', rot: -10, size: 11, opacity: 0.22, dur: 7.4, delay: 0.3 },
    { top: '52%', left: '70%', rot:  20, size: 12, opacity: 0.24, dur: 6.6, delay: 1.6 },
    { top: '85%', left: '28%', rot: -28, size: 10, opacity: 0.21, dur: 8.3, delay: 2.1 },
    { top: '32%', left: '50%', rot:  14, size: 9,  opacity: 0.19, dur: 7.0, delay: 3.5 },
    { top: '68%', left: '90%', rot: -22, size: 11, opacity: 0.22, dur: 6.8, delay: 1.0 },
  ],
};

const SPENDWISE_ICONS = {
  coin: [
    { top: '10%', left: '6%',  rot: -18, size: 12, opacity: 0.30, dur: 6.5, delay: 0.2 },
    { top: '70%', left: '4%',  rot:  20, size: 10, opacity: 0.24, dur: 7.7, delay: 1.4 },
    { top: '40%', left: '85%', rot: -14, size: 13, opacity: 0.28, dur: 6.9, delay: 0.8 },
    { top: '88%', left: '70%', rot:  32, size: 9,  opacity: 0.22, dur: 8.2, delay: 2.3 },
    { top: '20%', left: '78%', rot:  10, size: 11, opacity: 0.26, dur: 7.1, delay: 3.0 },
  ],
  receipt: [
    { top: '22%', left: '22%', rot:  8,  size: 12, opacity: 0.24, dur: 7.2, delay: 0.5 },
    { top: '60%', left: '38%', rot: -22, size: 11, opacity: 0.22, dur: 8.4, delay: 1.9 },
    { top: '15%', left: '58%', rot:  26, size: 13, opacity: 0.26, dur: 6.8, delay: 2.6 },
    { top: '78%', left: '52%', rot: -12, size: 10, opacity: 0.22, dur: 7.9, delay: 0.9 },
    { top: '48%', left: '12%', rot:  30, size: 11, opacity: 0.23, dur: 8.0, delay: 3.2 },
  ],
  dollar: [
    { top: '8%',  left: '38%', rot: -10, size: 11, opacity: 0.24, dur: 7.4, delay: 0.3 },
    { top: '52%', left: '70%', rot:  18, size: 12, opacity: 0.26, dur: 6.6, delay: 1.6 },
    { top: '85%', left: '28%', rot: -28, size: 10, opacity: 0.22, dur: 8.3, delay: 2.1 },
    { top: '32%', left: '50%', rot:  12, size: 9,  opacity: 0.20, dur: 7.0, delay: 3.5 },
    { top: '68%', left: '90%', rot: -22, size: 11, opacity: 0.24, dur: 6.8, delay: 1.0 },
  ],
};

const VOIDVAULT_ICONS = {
  lock: [
    { top: '12%', left: '7%',  rot: -18, size: 11, opacity: 0.28, dur: 6.2, delay: 0   },
    { top: '68%', left: '3%',  rot:  25, size: 9,  opacity: 0.22, dur: 7.8, delay: 1.1 },
    { top: '82%', left: '22%', rot:  40, size: 10, opacity: 0.24, dur: 8.1, delay: 0.7 },
    { top: '22%', left: '88%', rot: -30, size: 8,  opacity: 0.20, dur: 6.9, delay: 1.8 },
    { top: '55%', left: '78%', rot:  15, size: 12, opacity: 0.26, dur: 7.2, delay: 0.4 },
    { top: '8%',  left: '55%', rot: -45, size: 7,  opacity: 0.20, dur: 9.0, delay: 3.1 },
    { top: '75%', left: '62%', rot:  22, size: 9,  opacity: 0.22, dur: 6.4, delay: 2.0 },
    { top: '30%', left: '68%', rot: -22, size: 11, opacity: 0.25, dur: 6.8, delay: 2.7 },
    { top: '50%', left: '92%', rot:  28, size: 8,  opacity: 0.21, dur: 7.1, delay: 0.6 },
    { top: '90%', left: '72%', rot: -10, size: 9,  opacity: 0.22, dur: 6.3, delay: 1.3 },
  ],
  server: [
    { top: '5%',  left: '20%', rot:  10, size: 13, opacity: 0.22, dur: 7.5, delay: 0.3 },
    { top: '40%', left: '5%',  rot: -15, size: 11, opacity: 0.20, dur: 8.2, delay: 1.6 },
    { top: '70%', left: '35%', rot:  20, size: 12, opacity: 0.23, dur: 6.7, delay: 2.9 },
    { top: '18%', left: '42%', rot: -8,  size: 10, opacity: 0.19, dur: 7.9, delay: 0.8 },
    { top: '55%', left: '55%', rot:  35, size: 11, opacity: 0.21, dur: 6.1, delay: 3.4 },
    { top: '85%', left: '45%', rot: -25, size: 13, opacity: 0.24, dur: 8.5, delay: 1.2 },
    { top: '30%', left: '82%', rot:  18, size: 10, opacity: 0.20, dur: 7.3, delay: 2.1 },
    { top: '65%', left: '18%', rot: -12, size: 12, opacity: 0.22, dur: 6.9, delay: 0.5 },
    { top: '10%', left: '72%', rot:  28, size: 9,  opacity: 0.18, dur: 8.8, delay: 3.7 },
    { top: '92%', left: '88%', rot: -32, size: 11, opacity: 0.21, dur: 7.6, delay: 1.0 },
  ],
};

function FloatIcon({ it, children }: { it: { top: string; left: string; rot: number; size: number; opacity: number; dur: number; delay: number }; children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="vv-icon text-white/40"
      style={{
        position: 'absolute',
        top: it.top,
        left: it.left,
        width: it.size,
        height: it.size,
        opacity: it.opacity,
        transform: `rotate(${it.rot}deg)`,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <div style={{ animation: `vv-float ${it.dur}s ease-in-out ${it.delay}s infinite`, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

const CLAUSIFY_ICONS = {
  doc: [
    { top: '10%', left: '7%',  rot: -15, size: 12, opacity: 0.26, dur: 6.5, delay: 0.2 },
    { top: '68%', left: '4%',  rot:  22, size: 10, opacity: 0.22, dur: 7.8, delay: 1.3 },
    { top: '40%', left: '86%', rot: -10, size: 13, opacity: 0.24, dur: 6.9, delay: 0.7 },
    { top: '85%', left: '72%', rot:  28, size: 9,  opacity: 0.20, dur: 8.2, delay: 2.1 },
    { top: '20%', left: '60%', rot: -20, size: 11, opacity: 0.22, dur: 7.1, delay: 3.0 },
  ],
  shield: [
    { top: '22%', left: '24%', rot:  8,  size: 12, opacity: 0.24, dur: 7.2, delay: 0.5 },
    { top: '58%', left: '40%', rot: -20, size: 11, opacity: 0.22, dur: 8.4, delay: 1.8 },
    { top: '15%', left: '78%', rot:  25, size: 13, opacity: 0.26, dur: 6.8, delay: 2.5 },
    { top: '80%', left: '55%', rot: -12, size: 10, opacity: 0.20, dur: 7.9, delay: 0.9 },
    { top: '50%', left: '14%', rot:  32, size: 10, opacity: 0.21, dur: 8.0, delay: 3.3 },
  ],
};

function cardClass(p: PersonalProject) {
  if (p.spendwise) return 'proj-card proj-card-spendwise';
  if (p.void)      return 'proj-card proj-card-void';
  if (p.skilldash) return 'proj-card proj-card-skilldash';
  if (p.clausify)  return 'proj-card proj-card-clausify';
  return 'proj-card';
}

function PersonalProjectRow({ p, i, onVideoOpen }: { p: PersonalProject; i: number; onVideoOpen: (p: PersonalProject) => void }) {
  const [open, setOpen] = useState(false);
  const hasVideo = !!p.video;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl hairline overflow-hidden"
    >
      {/* Collapsed row — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        data-cursor="hover"
        aria-expanded={open}
        className="w-full text-left px-6 py-4 flex items-center gap-4 transition-colors hover:bg-accent/5 group"
      >
        {/* Chevron */}
        <motion.svg
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 text-muted group-hover:text-accent transition-colors"
        >
          <path d="M9 18l6-6-6-6" />
        </motion.svg>

        {/* Name */}
        <span className="font-semibold tracking-tight text-base shrink-0">{p.name}</span>

        {/* Tag pill */}
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted border border-fg/15 rounded-full px-2 py-0.5 shrink-0">
          {p.tag}
        </span>

        {/* Tech pills — hide overflow gracefully */}
        <div className="flex gap-1.5 flex-wrap overflow-hidden max-h-6 ml-1">
          {p.tech.slice(0, 6).map((t) => (
            <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent shrink-0">
              {t}
            </span>
          ))}
          {p.tech.length > 6 && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full text-muted shrink-0">
              +{p.tech.length - 6}
            </span>
          )}
        </div>
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
            <div className={`${cardClass(p)} px-7 py-7 md:px-9 md:py-8`}>

              {/* Floating icons */}
              {p.skilldash && (
                <>
                  {SKILLDASH_ICONS.hammer.map((it, idx) => (
                    <FloatIcon key={`h${idx}`} it={it}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <path d="M15 12l-8 8a2.83 2.83 0 1 1-4-4l8-8" /><path d="M17.64 15L22 10.64" /><path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
                      </svg>
                    </FloatIcon>
                  ))}
                  {SKILLDASH_ICONS.wrench.map((it, idx) => (
                    <FloatIcon key={`w${idx}`} it={it}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    </FloatIcon>
                  ))}
                  {SKILLDASH_ICONS.utensil.map((it, idx) => (
                    <FloatIcon key={`u${idx}`} it={it}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <path d="M3 2v7c0 1.1.9 2 2 2h2v11h2V2H7v7H5V2z" /><path d="M19 2v20h-2V12h-3V6c0-2.2 1.8-4 4-4z" />
                      </svg>
                    </FloatIcon>
                  ))}
                </>
              )}
              {p.spendwise && (
                <>
                  {SPENDWISE_ICONS.coin.map((it, idx) => (
                    <FloatIcon key={`c${idx}`} it={it}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <circle cx="12" cy="12" r="9" /><path d="M14.5 9c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5 1-2.5 2s1 1.7 2.5 2 2.5 1 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5" /><path d="M12 6v1.5M12 16.5V18" />
                      </svg>
                    </FloatIcon>
                  ))}
                  {SPENDWISE_ICONS.receipt.map((it, idx) => (
                    <FloatIcon key={`r${idx}`} it={it}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2z" /><path d="M8 8h8M8 12h6M8 16h7" />
                      </svg>
                    </FloatIcon>
                  ))}
                  {SPENDWISE_ICONS.dollar.map((it, idx) => (
                    <FloatIcon key={`d${idx}`} it={it}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <path d="M12 2v20" /><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </FloatIcon>
                  ))}
                </>
              )}
              {p.clausify && (
                <>
                  {CLAUSIFY_ICONS.doc.map((it, idx) => (
                    <FloatIcon key={`doc${idx}`} it={it}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                      </svg>
                    </FloatIcon>
                  ))}
                  {CLAUSIFY_ICONS.shield.map((it, idx) => (
                    <FloatIcon key={`shld${idx}`} it={it}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </FloatIcon>
                  ))}
                </>
              )}
              {p.void && (
                <>
                  {VOIDVAULT_ICONS.lock.map((it, idx) => (
                    <FloatIcon key={`lk${idx}`} it={it}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </FloatIcon>
                  ))}
                  {VOIDVAULT_ICONS.server.map((it, idx) => (
                    <FloatIcon key={`sv${idx}`} it={it}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
                      </svg>
                    </FloatIcon>
                  ))}
                </>
              )}

              {/* Content — dark mode: white text; light mode: dark text on soft purple bg */}
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase dark:text-white/55 text-violet-700">
                      {p.tag}
                    </span>
                    <h4 className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight dark:text-white text-fg">
                      {p.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {hasVideo && (
                      <button
                        onClick={() => onVideoOpen(p)}
                        data-cursor="hover"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1 rounded-full border dark:border-white/30 border-violet-400/50 dark:bg-white/10 bg-violet-500/10 dark:text-white text-violet-900 dark:hover:bg-white/20 hover:bg-violet-500/20 transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        Watch demo
                      </button>
                    )}
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="hover"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1 rounded-full border dark:border-white/30 border-violet-400/50 dark:bg-white/10 bg-violet-500/10 dark:text-white text-violet-900 dark:hover:bg-white/20 hover:bg-violet-500/20 transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        View Project
                      </a>
                    )}
                    {p.link ? (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" data-cursor="hover"
                        className="font-mono text-xs px-3 py-1 rounded-full border dark:border-white/25 border-violet-400/40 dark:text-white/70 text-violet-800 dark:hover:border-white/50 hover:border-violet-500/60 dark:hover:text-white hover:text-fg transition-colors">
                        {p.linkLabel}
                      </a>
                    ) : (
                      <span className="font-mono text-xs px-3 py-1 rounded-full border dark:border-white/20 border-violet-400/30 dark:text-white/50 text-violet-700/60">
                        {p.linkLabel}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-5 max-w-3xl text-sm leading-relaxed dark:text-white/75 text-fg/75">
                  {p.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span key={t} className="font-mono text-[11px] px-2.5 py-1 rounded-full border dark:border-white/20 border-violet-400/30 dark:text-white/80 text-fg/80">
                      {t}
                    </span>
                  ))}
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

  return (
    <section id="projects" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-6">
            04 / projects
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Things I've built.
          </h2>
        </SectionReveal>

        <p className="mt-4 text-base text-fg/50">
          <FadeText text="Side projects, client work, and everything in between." delay={0.2} />
        </p>

        {/* Personal projects — accordion rows */}
        <SectionReveal delay={0.15}>
          <h3 className="mt-16 mb-4 font-mono text-[11px] tracking-[0.2em] uppercase text-muted">
            ↳ Personal Projects
          </h3>
        </SectionReveal>

        <div className="flex flex-col gap-2">
          {PERSONAL_PROJECTS.map((p, i) => (
            <PersonalProjectRow key={p.name} p={p} i={i} onVideoOpen={setActive} />
          ))}
        </div>

        {/* Professional work */}
        <SectionReveal delay={0.1}>
          <h3 className="mt-20 mb-6 font-mono text-[11px] tracking-[0.2em] uppercase text-muted">
            ↳ What I Build (Professional)
          </h3>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROFESSIONAL_CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard className="shimmer h-full rounded-2xl p-7 hairline bg-bg/40 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">
                    Professional
                  </span>
                </div>
                <h4 className="mt-3 text-xl font-semibold tracking-tight">{c.title}</h4>
                <p className="mt-3 text-sm text-fg/75 leading-relaxed">{c.description}</p>
              </TiltCard>
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
