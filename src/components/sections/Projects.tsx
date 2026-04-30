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
                <TiltCard className="shimmer rounded-2xl p-7 md:p-9 hairline relative overflow-hidden text-fg group">
                  <div
                    role={hasVideo ? 'button' : undefined}
                    tabIndex={hasVideo ? 0 : -1}
                    onClick={openVideo}
                    onKeyDown={onKey}
                    data-cursor={hasVideo ? 'hover' : undefined}
                    aria-label={hasVideo ? `Watch ${p.name} demo video` : undefined}
                    className={`block ${hasVideo ? 'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl' : ''}`}
                  >
                    {p.void && (
                      <>
                        <div
                          aria-hidden
                          className="absolute inset-0 -z-10"
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
                      </>
                    )}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <span className={`font-mono text-[10px] tracking-[0.22em] uppercase ${p.void ? 'text-purple-300/80' : 'text-muted'}`}>
                          {p.tag}
                        </span>
                        <h4 className={`mt-2 text-3xl md:text-4xl font-bold tracking-tight ${p.void ? 'text-white' : ''}`}>
                          {p.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasVideo && (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1 rounded-full border border-purple-300/40 bg-purple-500/15 text-purple-100 transition-all group-hover:bg-purple-500/30 group-hover:border-purple-300/70">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            Watch demo
                          </span>
                        )}
                        <span className={`font-mono text-xs px-3 py-1 rounded-full ${p.void ? 'border border-white/20 text-white/70' : 'hairline text-muted'}`}>
                          {p.linkLabel}
                        </span>
                      </div>
                    </div>

                    <p className={`mt-5 max-w-3xl text-sm leading-relaxed ${p.void ? 'text-white/70' : 'text-fg/75'}`}>
                      {p.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          className={`font-mono text-[11px] px-2.5 py-1 rounded-full ${
                            p.void
                              ? 'border border-white/15 text-white/80'
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
