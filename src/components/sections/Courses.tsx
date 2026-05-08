import { SectionReveal } from '../shared/SectionReveal';
import { FadeText } from '../shared/FadeText';
import { COURSES } from '../../data/courses';

export function Courses() {
  return (
    <section id="courses" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-6">
            05 / courses
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Always learning.
          </h2>
        </SectionReveal>

        <p className="mt-4 text-base text-fg/50">
          <FadeText text="What I've studied. What stuck." delay={0.2} />
        </p>

        <div className="mt-12 hairline-t">
          {COURSES.map((c, i) => (
            <SectionReveal key={c.title} delay={i * 0.05}>
              <div className="hairline-b py-6 grid grid-cols-12 gap-4 items-baseline">
                <span className="col-span-12 md:col-span-1 font-mono text-xs text-muted">
                  /0{i + 1}
                </span>
                <h3 className="col-span-12 md:col-span-6 text-lg font-medium">{c.title}</h3>
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
