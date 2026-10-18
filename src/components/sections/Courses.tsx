import { SectionReveal } from '../shared/SectionReveal';
import { SectionHeader } from '../shared/SectionHeader';
import { COURSES } from '../../data/courses';

export function Courses() {
  return (
    <section id="courses" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          index="06"
          label="Courses"
          title="Always learning"
          sub="From full-stack foundations to LLMs, RAG and agents. What stuck."
        />

        <div className="mt-12 hairline-t">
          {COURSES.map((c, i) => (
            <SectionReveal key={c.title} delay={i * 0.05}>
              <div className="hairline-b py-6 grid grid-cols-12 gap-4 items-baseline group hover:bg-fg/[0.03] transition-colors px-2">
                <span className="col-span-12 md:col-span-1 font-mono text-xs text-muted">
                  ({String(i + 1).padStart(2, '0')})
                </span>
                <h3 className="col-span-12 md:col-span-6 text-xl font-normal tracking-[-0.02em] transition-transform duration-300 group-hover:translate-x-2">
                  {c.title}
                </h3>
                <p className="col-span-7 md:col-span-3 text-sm text-fg/70">{c.org}</p>
                <p className="col-span-5 md:col-span-2 font-mono text-xs text-muted text-right">
                  {c.period}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
