import { motion } from 'framer-motion';
import { useState } from 'react';
import { SectionReveal } from '../shared/SectionReveal';
import { FadeText } from '../shared/FadeText';
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

        <p className="mt-4 text-base text-fg/50">
          <FadeText text="Side projects, client work, and everything in between." delay={0.2} />
        </p>

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
                    {p.skilldash && (
                      <>
                        {/* dark mode: caramel/honey-brown */}
                        <div
                          aria-hidden
                          className="absolute inset-0 -z-10 hidden dark:block"
                          style={{
                            background:
                              'radial-gradient(ellipse at 80% 0%, rgb(217 145 36 / 0.28), transparent 60%), radial-gradient(ellipse at 10% 100%, rgb(159 99 24 / 0.16), transparent 60%), linear-gradient(135deg, rgb(48 30 12), rgb(28 18 8))',
                          }}
                        />
                        {/* light mode: honey-gold parchment */}
                        <div
                          aria-hidden
                          className="absolute inset-0 -z-10 block dark:hidden"
                          style={{
                            background:
                              'radial-gradient(ellipse at 80% 0%, rgb(238 178 64 / 0.55), transparent 60%), radial-gradient(ellipse at 10% 100%, rgb(206 137 51 / 0.30), transparent 60%), linear-gradient(135deg, rgb(252 240 213), rgb(245 224 178))',
                          }}
                        />
                        {/* dot grid */}
                        <div
                          aria-hidden
                          className="absolute inset-0 -z-10 opacity-30 dark:opacity-40"
                          style={{
                            backgroundImage:
                              'radial-gradient(circle at 1px 1px, rgb(120 70 16 / 0.18) 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                          }}
                        />
                        {/* Hammer icons */}
                        {[
                          { top: '10%', left: '6%',  rot: -20, size: 12, opacity: 0.26, dur: 6.4, delay: 0.2 },
                          { top: '70%', left: '4%',  rot:  18, size: 10, opacity: 0.22, dur: 7.6, delay: 1.4 },
                          { top: '40%', left: '85%', rot: -12, size: 11, opacity: 0.24, dur: 6.9, delay: 0.8 },
                          { top: '88%', left: '70%', rot:  30, size: 9,  opacity: 0.20, dur: 8.2, delay: 2.3 },
                        ].map((it, idx) => (
                          <div
                            key={`hammer-${idx}`}
                            aria-hidden
                            className="vv-icon text-amber-500 dark:text-amber-300"
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
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                <path d="M15 12l-8 8a2.83 2.83 0 1 1-4-4l8-8" />
                                <path d="M17.64 15L22 10.64" />
                                <path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
                              </svg>
                            </div>
                          </div>
                        ))}
                        {/* Pipe / wrench icons */}
                        {[
                          { top: '22%', left: '22%', rot:  10, size: 11, opacity: 0.22, dur: 7.1, delay: 0.5 },
                          { top: '60%', left: '38%', rot: -25, size: 10, opacity: 0.20, dur: 8.5, delay: 1.9 },
                          { top: '15%', left: '60%', rot:  28, size: 12, opacity: 0.24, dur: 6.7, delay: 2.6 },
                          { top: '78%', left: '52%', rot: -15, size: 9,  opacity: 0.20, dur: 7.9, delay: 0.9 },
                          { top: '48%', left: '12%', rot:  35, size: 10, opacity: 0.21, dur: 8.0, delay: 3.2 },
                        ].map((it, idx) => (
                          <div
                            key={`wrench-${idx}`}
                            aria-hidden
                            className="vv-icon text-amber-500 dark:text-amber-300"
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
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                              </svg>
                            </div>
                          </div>
                        ))}
                        {/* Utensils icons */}
                        {[
                          { top: '8%',  left: '38%', rot: -10, size: 11, opacity: 0.22, dur: 7.4, delay: 0.3 },
                          { top: '52%', left: '70%', rot:  20, size: 12, opacity: 0.24, dur: 6.6, delay: 1.6 },
                          { top: '85%', left: '28%', rot: -28, size: 10, opacity: 0.21, dur: 8.3, delay: 2.1 },
                          { top: '32%', left: '50%', rot:  14, size: 9,  opacity: 0.19, dur: 7.0, delay: 3.5 },
                          { top: '68%', left: '90%', rot: -22, size: 11, opacity: 0.22, dur: 6.8, delay: 1.0 },
                        ].map((it, idx) => (
                          <div
                            key={`utensil-${idx}`}
                            aria-hidden
                            className="vv-icon text-amber-500 dark:text-amber-300"
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
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                <path d="M3 2v7c0 1.1.9 2 2 2h2v11h2V2H7v7H5V2z" />
                                <path d="M19 2v20h-2V12h-3V6c0-2.2 1.8-4 4-4z" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {p.spendwise && (
                      <>
                        {/* dark mode: faintest warm — soft cream-tinted brown */}
                        <div
                          aria-hidden
                          className="absolute inset-0 -z-10 hidden dark:block"
                          style={{
                            background:
                              'radial-gradient(ellipse at 75% 0%, rgb(244 212 136 / 0.16), transparent 60%), radial-gradient(ellipse at 10% 100%, rgb(220 195 150 / 0.10), transparent 60%), linear-gradient(135deg, rgb(34 26 18), rgb(22 16 10))',
                          }}
                        />
                        {/* light mode: lightest of trio — cream + pale amber */}
                        <div
                          aria-hidden
                          className="absolute inset-0 -z-10 block dark:hidden"
                          style={{
                            background:
                              'radial-gradient(ellipse at 75% 0%, rgb(248 224 163 / 0.50), transparent 65%), radial-gradient(ellipse at 10% 100%, rgb(232 200 162 / 0.28), transparent 60%), linear-gradient(135deg, rgb(253 249 238), rgb(248 240 223))',
                          }}
                        />
                        {/* paper grain */}
                        <div
                          aria-hidden
                          className="absolute inset-0 -z-10 opacity-30 dark:opacity-25"
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.40 0 0 0 0 0.20 0 0 0 0.10 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                          }}
                        />
                        {/* Coin icons */}
                        {[
                          { top: '10%', left: '6%',  rot: -18, size: 12, opacity: 0.30, dur: 6.5, delay: 0.2 },
                          { top: '70%', left: '4%',  rot:  20, size: 10, opacity: 0.24, dur: 7.7, delay: 1.4 },
                          { top: '40%', left: '85%', rot: -14, size: 13, opacity: 0.28, dur: 6.9, delay: 0.8 },
                          { top: '88%', left: '70%', rot:  32, size: 9,  opacity: 0.22, dur: 8.2, delay: 2.3 },
                          { top: '20%', left: '78%', rot:  10, size: 11, opacity: 0.26, dur: 7.1, delay: 3.0 },
                        ].map((it, idx) => (
                          <div
                            key={`coin-${idx}`}
                            aria-hidden
                            className="vv-icon text-amber-600 dark:text-amber-300"
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
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                <circle cx="12" cy="12" r="9" />
                                <path d="M14.5 9c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5 1-2.5 2s1 1.7 2.5 2 2.5 1 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5" />
                                <path d="M12 6v1.5M12 16.5V18" />
                              </svg>
                            </div>
                          </div>
                        ))}
                        {/* Receipt icons */}
                        {[
                          { top: '22%', left: '22%', rot:  8,  size: 12, opacity: 0.24, dur: 7.2, delay: 0.5 },
                          { top: '60%', left: '38%', rot: -22, size: 11, opacity: 0.22, dur: 8.4, delay: 1.9 },
                          { top: '15%', left: '58%', rot:  26, size: 13, opacity: 0.26, dur: 6.8, delay: 2.6 },
                          { top: '78%', left: '52%', rot: -12, size: 10, opacity: 0.22, dur: 7.9, delay: 0.9 },
                          { top: '48%', left: '12%', rot:  30, size: 11, opacity: 0.23, dur: 8.0, delay: 3.2 },
                        ].map((it, idx) => (
                          <div
                            key={`receipt-${idx}`}
                            aria-hidden
                            className="vv-icon text-walnut-700 dark:text-amber-200"
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
                              color: 'rgb(82 60 42)',
                            }}
                          >
                            <div style={{ animation: `vv-float ${it.dur}s ease-in-out ${it.delay}s infinite`, width: '100%', height: '100%' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                <path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2z" />
                                <path d="M8 8h8M8 12h6M8 16h7" />
                              </svg>
                            </div>
                          </div>
                        ))}
                        {/* Ledger / dollar mark icons */}
                        {[
                          { top: '8%',  left: '38%', rot: -10, size: 11, opacity: 0.24, dur: 7.4, delay: 0.3 },
                          { top: '52%', left: '70%', rot:  18, size: 12, opacity: 0.26, dur: 6.6, delay: 1.6 },
                          { top: '85%', left: '28%', rot: -28, size: 10, opacity: 0.22, dur: 8.3, delay: 2.1 },
                          { top: '32%', left: '50%', rot:  12, size: 9,  opacity: 0.20, dur: 7.0, delay: 3.5 },
                          { top: '68%', left: '90%', rot: -22, size: 11, opacity: 0.24, dur: 6.8, delay: 1.0 },
                        ].map((it, idx) => (
                          <div
                            key={`mark-${idx}`}
                            aria-hidden
                            className="vv-icon text-amber-700 dark:text-amber-300"
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
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                                <path d="M12 2v20" />
                                <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {p.void && (
                      <>
                        {/* dark mode: deepest — walnut+bronze */}
                        <div
                          aria-hidden
                          className="vv-bg absolute inset-0 -z-10 hidden dark:block"
                          style={{
                            background:
                              'radial-gradient(ellipse at 20% 0%, rgb(184 124 38 / 0.30), transparent 60%), radial-gradient(ellipse at 90% 100%, rgb(140 78 24 / 0.22), transparent 60%), linear-gradient(135deg, rgb(28 18 10), rgb(14 8 4))',
                          }}
                        />
                        {/* light mode: warm bronze parchment — deepest of trio */}
                        <div
                          aria-hidden
                          className="vv-bg absolute inset-0 -z-10 block dark:hidden"
                          style={{
                            background:
                              'radial-gradient(ellipse at 20% 0%, rgb(180 113 36 / 0.40), transparent 60%), radial-gradient(ellipse at 90% 100%, rgb(149 90 26 / 0.30), transparent 60%), linear-gradient(135deg, rgb(238 215 175), rgb(220 192 145))',
                          }}
                        />
                        <div
                          aria-hidden
                          className="absolute inset-0 -z-10 opacity-30 dark:opacity-40"
                          style={{
                            backgroundImage:
                              'radial-gradient(circle at 1px 1px, rgb(82 50 12 / 0.18) 1px, transparent 0)',
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
                            className="vv-icon text-amber-700 dark:text-amber-400"
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
                            className="vv-icon text-amber-800 dark:text-amber-300"
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
                        <span className={`font-mono text-[10px] tracking-[0.22em] uppercase ${(p.void || p.skilldash || p.spendwise) ? 'dark:text-amber-300/80 text-amber-700/80' : 'text-muted'}`}>
                          {p.tag}
                        </span>
                        <h4 className={`mt-2 text-3xl md:text-4xl font-bold tracking-tight ${(p.void || p.skilldash || p.spendwise) ? 'dark:text-white text-fg' : ''}`}>
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
                            className="inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1 rounded-full transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent border border-amber-500/40 bg-amber-500/15 dark:text-amber-100 text-amber-800 hover:bg-amber-500/30 hover:border-amber-500/70"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            Watch demo
                          </span>
                        )}
                        {p.liveUrl && (
                          <a
                            href={p.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor="hover"
                            className={`inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1 rounded-full transition-all ${
                              (p.skilldash || p.spendwise)
                                ? 'border border-amber-500/60 bg-amber-500/20 dark:text-amber-100 text-amber-800 hover:bg-amber-500/35 hover:border-amber-500/80'
                                : 'border border-fg/20 dark:border-white/20 text-fg/70 dark:text-white/70 hover:border-fg/50 dark:hover:border-white/50'
                            }`}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            View Project
                          </a>
                        )}
                        {p.link ? (
                          <a href={p.link} target="_blank" rel="noopener noreferrer" data-cursor="hover" className={`font-mono text-xs px-3 py-1 rounded-full ${(p.void || p.skilldash || p.spendwise) ? 'border border-fg/20 dark:border-white/20 text-fg/70 dark:text-white/70 hover:border-fg/50 dark:hover:border-white/50 hover:text-fg dark:hover:text-white' : 'hairline text-muted hover:text-fg'} transition-colors`}>
                            {p.linkLabel}
                          </a>
                        ) : (
                          <span className={`font-mono text-xs px-3 py-1 rounded-full ${(p.void || p.skilldash || p.spendwise) ? 'border border-fg/20 dark:border-white/20 text-fg/70 dark:text-white/70' : 'hairline text-muted'}`}>
                            {p.linkLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={`mt-5 max-w-3xl text-sm leading-relaxed ${(p.void || p.skilldash || p.spendwise) ? 'dark:text-white/70 text-fg/75' : 'text-fg/75'}`}>
                      {p.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          className={`font-mono text-[11px] px-2.5 py-1 rounded-full ${
                            (p.void || p.skilldash || p.spendwise)
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
