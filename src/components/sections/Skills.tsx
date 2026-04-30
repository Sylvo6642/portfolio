import { motion } from 'framer-motion';
import { SectionReveal } from '../shared/SectionReveal';
import { Pill } from '../shared/Pill';
import { SKILL_GROUPS } from '../../data/skills';

export function Skills() {
  return (
    <section id="skills" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
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

        <div className="mt-16 space-y-12">
          {SKILL_GROUPS.map((group) => (
            <div key={group.title}>
              <SectionReveal>
                <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted mb-5">
                  ↳ {group.title}
                </h3>
              </SectionReveal>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                className="flex flex-wrap gap-2"
              >
                {group.items.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
