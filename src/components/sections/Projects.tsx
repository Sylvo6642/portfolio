import { motion } from 'framer-motion';
import { useState } from 'react';
import { SectionReveal } from '../shared/SectionReveal';
import { TiltCard } from '../shared/TiltCard';
import { VideoModal } from '../shared/VideoModal';
import { PERSONAL_PROJECTS, PROFESSIONAL_CARDS, type PersonalProject } from '../../data/projects';

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

        {/* Personal projects */}
        <SectionReveal delay={0.15}>
          <h3 className="mt-16 mb-6 font-mono text-[11px] tracking-[0.2em] uppercase text-muted">
            ↳ Personal Projects
          </h3>
        </SectionReveal>

        <div className="grid grid-cols-1 gap-6">
          {PERSONAL_PROJECTS.map((p, i) => {
            const hasVideo = !!p.video;
            const openVideo = () => hasVideo && setActive(p);
            const onKey = (e: React.KeyboardEvent) => {
              if (!hasVideo) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openVideo();
              }
            };
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard max={2} className="shimmer rounded-2xl p-7 md:p-9 hairline relative overflow-hidden text-fg group">
                  <div className="block">
                    {p.void && (
                      <>
                        <div
                          aria-hidden
                          className="vv-bg absolute inset-0 -z-10"
                          style={{
                            background:
                              'radial-gradient(ellipse at 20% 0%, rgb(124 58 237 / 0.25), transparent 60%), linear-gradient(135deg, rgb(26 10 46), rgb(10 5 22))',
                          }}
                        />
                        <div
                          aria-hidden
                          className="absolute inset-0 -z-10 opacity-40"
                          style={{
                            backgroundImage:
                              'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.08) 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                          }}
                        />
                        {/* Lock icons */}
                        {[
                          { top: '12%',  left: '7%',   rot: -18, size: 11, opacity: 0.28, dur: 6.2, delay: 0 },
                          { top: '68%',  left: '3%',   rot:  25, size: 9,  opacity: 0.22, dur: 7.8, delay: 1.1 },
                          { top: '82%',  left: '22%',  rot:  40, size: 10, opacity: 0.24, dur: 8.1, delay: 0.7 },
                          { top: '22%',  left: '88%',  rot: -30, size: 8,  opacity: 0.20, dur: 6.9, delay: 1.8 },
                          { top: '55%',  left: '78%',  rot:  15, size: 12, opacity: 0.26, dur: 7.2, delay: 0.4 },
                          { top: '8%',   left: '55%',  rot: -45, size: 7,  opacity: 0.20, dur: 9.0, delay: 3.1 },
                          { top: '75%',  left: '62%',  rot:  22, size: 9,  opacity: 0.22, dur: 6.4, delay: 2.0 },
                          { top: '30%',  left: '68%',  rot: -22, size: 11, opacity: 0.25, dur: 6.8, delay: 2.7 },
                          { top: '50%',  left: '92%',  rot:  28, size: 8,  opacity: 0.21, dur: 7.1, delay: 0.6 },
                          { top: '90%',  left: '72%',  rot: -10, size: 9,  opacity: 0.22, dur: 6.3, delay: 1.3 },
                        ].map((lk, idx) => (
                          <div
                            key={`lock-${idx}`}
                            aria-hidden
                            className="vv-icon"
                            style={{
                              position: 'absolute',
                              top: lk.top,
                              left: lk.left,
                              width: lk.size,
                              height: lk.size,
                              opacity: lk.opacity,
                              transform: `rotate(${lk.rot}deg)`,
                              zIndex: 0,
                              pointerEvents: 'none',
                            }}
                          >
                            <div style={{ animation: `vv-float ${lk.dur}s ease-in-out ${lk.delay}s infinite`, width: '100%', height: '100%' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            </div>
                          </div>
                        ))}
                        {/* Server/storage rack icons */}
                        {[
                          { top: '5%',   left: '20%',  rot:  10, size: 13, opacity: 0.22, dur: 7.5, delay: 0.3 },
                          { top: '40%',  left: '5%',   rot: -15, size: 11, opacity: 0.20, dur: 8.2, delay: 1.6 },
                          { top: '70%',  left: '35%',  rot:  20, size: 12, opacity: 0.23, dur: 6.7, delay: 2.9 },
                          { top: '18%',  left: '42%',  rot: -8,  size: 10, opacity: 0.19, dur: 7.9, delay: 0.8 },
                          { top: '55%',  left: '55%',  rot:  35, size: 11, opacity: 0.21, dur: 6.1, delay: 3.4 },
                          { top: '85%',  left: '45%',  rot: -25, size: 13, opacity: 0.24, dur: 8.5, delay: 1.2 },
                          { top: '30%',  left: '82%',  rot:  18, size: 10, opacity: 0.20, dur: 7.3, delay: 2.1 },
                          { top: '65%',  left: '18%',  rot: -12, size: 12, opacity: 0.22, dur: 6.9, delay: 0.5 },
                          { top: '10%',  left: '72%',  rot:  28, size: 9,  opacity: 0.18, dur: 8.8, delay: 3.7 },
                          { top: '92%',  left: '88%',  rot: -32, size: 11, opacity: 0.21, dur: 7.6, delay: 1.0 },
                        ].map((sv, idx) => (
                          <div
                            key={`server-${idx}`}
                            aria-hidden
                            className="vv-icon"
                            style={{
                              position: 'absolute',
                              top: sv.top,
                              left: sv.left,
                              width: sv.size,
                              height: sv.size,
                              opacity: sv.opacity,
                              transform: `rotate(${sv.rot}deg)`,
                              zIndex: 0,
                              pointerEvents: 'none',
                            }}
                          >
                            <div style={{ animation: `vv-float ${sv.dur}s ease-in-out ${sv.delay}s infinite`, width: '100%', height: '100%' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                                <line x1="6" y1="6" x2="6.01" y2="6" />
                                <line x1="6" y1="18" x2="6.01" y2="18" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <span className={`font-mono text-[10px] tracking-[0.22em] uppercase ${p.void ? 'dark:text-purple-300/80 text-purple-700/80' : 'text-muted'}`}>
                          {p.tag}
                        </span>
                        <h4 className={`mt-2 text-3xl md:text-4xl font-bold tracking-tight ${p.void ? 'dark:text-white text-fg' : ''}`}>
                          {p.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasVideo && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={openVideo}
                            onKeyDown={onKey}
                            data-cursor="hover"
                            aria-label={`Watch ${p.name} demo video`}
                            className="inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/15 dark:text-purple-100 text-purple-800 transition-all hover:bg-purple-500/30 hover:border-purple-500/70 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            Watch demo
                          </span>
                        )}
                        {p.link ? (
                          <a href={p.link} target="_blank" rel="noopener noreferrer" data-cursor="hover" className={`font-mono text-xs px-3 py-1 rounded-full ${p.void ? 'border border-fg/20 dark:border-white/20 text-fg/70 dark:text-white/70 hover:border-fg/50 dark:hover:border-white/50 hover:text-fg dark:hover:text-white' : 'hairline text-muted hover:text-fg'} transition-colors`}>
                            {p.linkLabel}
                          </a>
                        ) : (
                          <span className={`font-mono text-xs px-3 py-1 rounded-full ${p.void ? 'border border-fg/20 dark:border-white/20 text-fg/70 dark:text-white/70' : 'hairline text-muted'}`}>
                            {p.linkLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={`mt-5 max-w-3xl text-sm leading-relaxed ${p.void ? 'dark:text-white/70 text-fg/75' : 'text-fg/75'}`}>
                      {p.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          className={`font-mono text-[11px] px-2.5 py-1 rounded-full ${
                            p.void
                              ? 'border border-fg/15 dark:border-white/15 text-fg/80 dark:text-white/80'
                              : 'hairline text-fg/80'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
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
