import { motion } from 'framer-motion';

const DELIVERABLES = [
  {
    icon: '✦',
    title: 'LLM-Powered Features',
    description: 'Chat, summarisation, extraction and classification on GPT, Claude, Gemini, Grok and Mistral, with streaming UIs via the Vercel AI SDK.',
  },
  {
    icon: '◎',
    title: 'RAG Pipelines',
    description: 'Chunking, embeddings and retrieval over Weaviate or Pinecone, so answers are grounded in your own data instead of guessed.',
  },
  {
    icon: '⟳',
    title: 'AI Agents & Tool Calling',
    description: 'Agents that route between tools, call your APIs and act on the results, with guardrails, retries and sensible fallbacks.',
  },
  {
    icon: '{ }',
    title: 'Structured AI Output',
    description: 'Schema-constrained generation that returns validated JSON your app can trust, not prose it has to parse.',
  },
  {
    icon: '🔐',
    title: 'Secure AI Integrations',
    description: 'API keys behind server-side proxies, prompt-injection-aware input handling, and rate-limit and cost controls.',
  },
  {
    icon: '🔌',
    title: 'Full-Stack Web Apps',
    description: 'Django, Angular and React products end to end: APIs, auth, admin tooling and polished, accessible UI.',
  },
  {
    icon: '🗄️',
    title: 'Data & Performance',
    description: 'Schema design, indexing and query optimisation across SQL and NoSQL, plus the N+1 hunts nobody else wants.',
  },
  {
    icon: '🔗',
    title: 'Integrations & Automation',
    description: 'Payment gateways, webhooks, third-party APIs and n8n workflows that wire AI into the tools you already use.',
  },
];
import { SectionReveal } from '../shared/SectionReveal';
import { SectionHeader } from '../shared/SectionHeader';
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
  Redis:        '#DC382D',
  HTML:         '#e65100',
  CSS:          '#7e57c2',
  Bootstrap:    '#7952B3',
  GitHub:       '#ffffff',
  GitLab:       '#FC6D26',
  Bash:         '#4EAA25',
  n8n:          '#EA4B71',
  'FastAPI':      '#009688',
  'OpenAI (ChatGPT)': '#10a37f',
  Whisper:        '#10a37f',
  Gemini:         '#4285F4',
  Claude:         '#d97706',
  Grok:           '#888888',
  Mistral:        '#FA520F',
  'Ollama':       '#ffffff',
  'Hugging Face Transformers': '#FFD21E',
  'AI Agents':    '#B9803F',
  RAG:            '#0EA5E9',
  'Tool Calling & Routing': '#14B8A6',
  Weaviate:       '#00C29A',
  Pinecone:       '#6366F1',
  'Vercel AI SDK': '#888888',
  SEO:              '#4285F4',
  'Core Web Vitals': '#0cce6b',
  Lighthouse:       '#F44B21',
  'Structured Outputs': '#7A4A2B',
  'Prompt Engineering': '#8B5CF6',
};

function SkillPill({ name, color }: { name: string; color: string }) {
  const icon = SKILL_ICONS[name];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium hairline cursor-default select-none"
      style={{
        background: 'rgb(var(--bg) / 0.6)',
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
    </span>
  );
}

export function Skills() {
  return (
    <section id="skills" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6 mb-16">
        <SectionHeader
          index="03"
          label="Skills"
          title="What I work with"
          sub="My stack, from backend logic to delivered pixel."
        />
      </div>

      {/* Grouped skill layout */}
      <div className="mx-auto max-w-6xl px-6 flex flex-col gap-10">
        {SKILL_GROUPS.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: gi * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted mb-4">
              {group.title}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {group.items.map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: gi * 0.08 + i * 0.04 }}
                >
                  <SkillPill
                    name={name}
                    color={SKILL_COLORS[name] ?? 'rgb(var(--accent))'}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* What I Deliver */}
      <div className="mx-auto max-w-6xl px-6 mt-24">
        <SectionReveal delay={0.1}>
          <h3 className="display-type text-3xl md:text-5xl mb-10">
            What I Deliver
          </h3>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DELIVERABLES.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="hairline p-5 bg-bg/40 flex flex-col gap-2 hover:bg-fg/[0.04] transition-colors"
            >
              <h4 className="font-medium text-base tracking-[-0.01em]">{item.title}</h4>
              <p className="text-xs text-fg/55 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
