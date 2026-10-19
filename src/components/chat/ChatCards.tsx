import type { ReactNode } from 'react';
import type { ChatAvailability, ChatContact, ChatExperience, ChatMessage, ChatProject } from './chatClient';

type ToolPart = Extract<ChatMessage['parts'][number], { type: `tool-${string}` }>;

const LOADING: Record<string, string> = {
  'tool-showProjects': 'Pulling up projects',
  'tool-showExperience': 'Opening my work history',
  'tool-showSkills': 'Gathering my stack',
  'tool-showContact': 'Getting my contact details',
  'tool-showResume': 'Fetching my CV',
};

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl hairline bg-surface p-4">{children}</div>;
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-full hairline px-2.5 py-0.5 text-[11px] text-fg/75">{children}</span>;
}

function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  const external = !href.startsWith('mailto:');
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-on-accent transition-colors hover:bg-accent-hover"
    >
      {children}
      <span aria-hidden>↗</span>
    </a>
  );
}

const STATUS: Record<ChatProject['status'], string> = { live: 'Live', wip: 'In progress', private: 'Private' };

function Projects({ projects }: { projects: ChatProject[] }) {
  return (
    <div className="flex flex-col gap-2">
      {projects.map((p) => (
        <Card key={p.name}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[15px] font-medium">{p.name}</p>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">{STATUS[p.status]}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted">{p.category}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-fg/80">{p.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.tech.slice(0, 5).map((t) => <Chip key={t}>{t}</Chip>)}
          </div>
          {(p.liveUrl || p.repo) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {p.liveUrl && <LinkButton href={p.liveUrl}>Open</LinkButton>}
              {p.repo && <LinkButton href={p.repo}>GitHub</LinkButton>}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function Experience({ experience }: { experience: ChatExperience[] }) {
  return (
    <Card>
      <ol className="flex flex-col gap-4">
        {experience.map((e) => (
          <li key={e.company + e.start} className="relative pl-4">
            <span aria-hidden className="absolute left-0 top-[7px] h-1.5 w-1.5 rounded-full bg-accent" />
            <p className="text-[14px] font-medium leading-snug">{e.role}</p>
            <p className="text-xs text-muted">{e.company} · {e.start} – {e.end ?? 'Present'} · {e.location}</p>
            <ul className="mt-1.5 flex flex-col gap-1 text-[13px] leading-relaxed text-fg/80">
              {e.bullets.slice(0, 2).map((b) => <li key={b}>{b}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function Skills({ skills }: { skills: { title: string; items: string[] }[] }) {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        {skills.map((g) => (
          <div key={g.title}>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">{g.title}</p>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((s) => <Chip key={s}>{s}</Chip>)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Contact({ contact, availability }: { contact: ChatContact; availability: ChatAvailability }) {
  return (
    <Card>
      {availability.openToWork && (
        <p className="flex items-center gap-2 text-[13px]">
          <span aria-hidden className="h-2 w-2 rounded-full bg-[#5BB974]" />
          Open to {availability.roles.join(' / ')} roles · {availability.locations}
        </p>
      )}
      <a href={`mailto:${contact.email}`} className="mt-2 block text-[15px] font-medium underline decoration-edge-strong underline-offset-4 hover:decoration-accent">
        {contact.email}
      </a>
      <div className="mt-3 flex flex-wrap gap-2">
        <LinkButton href={`mailto:${contact.email}`}>Email</LinkButton>
        <LinkButton href={contact.linkedin}>LinkedIn</LinkButton>
        <LinkButton href={contact.github}>GitHub</LinkButton>
      </div>
    </Card>
  );
}

function Resume({ url, name }: { url: string; name: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-9 shrink-0 place-items-center rounded-md bg-accent font-mono text-[10px] font-semibold text-on-accent">PDF</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium">{name}</p>
          <p className="text-xs text-muted">Full experience, skills and education</p>
        </div>
        <LinkButton href={url}>View</LinkButton>
      </div>
    </Card>
  );
}

export function ToolCard({ part, showInternals }: { part: ToolPart; showInternals: boolean }) {
  const call = showInternals && 'input' in part && part.input && (
    <p className="mb-1.5 font-mono text-[10px] text-muted">
      → {part.type.slice(5)}({Object.keys(part.input).length ? JSON.stringify(part.input) : ''})
    </p>
  );

  if (part.state === 'output-error') {
    return <p className="text-xs text-muted">Couldn't load that card. Ask again in a moment.</p>;
  }
  if (part.state !== 'output-available') {
    return (
      <div>
        {call}
        <p className="text-xs text-muted animate-pulse">{LOADING[part.type] ?? 'Working'}…</p>
      </div>
    );
  }

  let card: ReactNode = null;
  switch (part.type) {
    case 'tool-showProjects': card = <Projects projects={part.output.projects} />; break;
    case 'tool-showExperience': card = <Experience experience={part.output.experience} />; break;
    case 'tool-showSkills': card = <Skills skills={part.output.skills} />; break;
    case 'tool-showContact': card = <Contact contact={part.output.contact} availability={part.output.availability} />; break;
    case 'tool-showResume': card = <Resume url={part.output.url} name={part.output.name} />; break;
  }
  return <div>{call}{card}</div>;
}
