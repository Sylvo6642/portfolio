import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/**
 * An illustrative trace of a RAG pipeline answering questions about my own work:
 * embed the question, retrieve the nearest chunks, rerank them, pack the survivors into
 * the prompt, then stream an answer with citations. Every chunk is a fact from this site;
 * the scores and positions are hand-tuned for the illustration, not computed live.
 */

type Chunk = { id: number; source: string; text: string; x: number; y: number };

// Positions are on a 200 × 130 map, grouped by meaning: AI work top right,
// frontend work on the left, security along the bottom
const CHUNKS: Chunk[] = [
  { id: 1, source: 'clausify/README.md', text: 'An LLM pipeline that flags risky contract clauses and explains each one in plain English.', x: 150, y: 30 },
  { id: 2, source: 'clausify/stack.md', text: 'Schema-constrained JSON output from the Gemini API at low temperature, so the UI can always trust it.', x: 170, y: 52 },
  { id: 3, source: 'experience/indeeya.md', text: 'Full-stack developer at Indeeya® (Lidex Tech), shipping Django, Angular and React products.', x: 48, y: 44 },
  { id: 4, source: 'commitgrid/README.md', text: 'Animated GitHub-style contribution heatmap for React, published on npm.', x: 30, y: 72 },
  { id: 5, source: 'portfolio/ask-ai-kevin.md', text: 'A tool-calling chat assistant on gpt-4o-mini, grounded in my portfolio and rate limited.', x: 128, y: 58 },
  { id: 6, source: 'voidvault/README.md', text: 'Encrypted personal cloud storage on a Discord backend.', x: 112, y: 108 },
  { id: 7, source: 'about.md', text: 'Came up through cybersecurity before moving into full-stack and AI engineering.', x: 74, y: 112 },
];

type Query = {
  question: string;
  /** Where the question's embedding lands on the map */
  at: { x: number; y: number };
  /** Top k = 4 by cosine similarity */
  retrieved: { id: number; score: number }[];
  /** After the cross-encoder rerank; anything missing here was dropped */
  reranked: { id: number; score: number }[];
  contextTokens: number;
  questionTokens: number;
  /** [n] cites chunk n, the same number as on the map and in the list */
  answer: string;
};

const QUERIES: Query[] = [
  {
    question: 'What has Kevin built with LLMs?',
    at: { x: 146, y: 44 },
    retrieved: [{ id: 1, score: 0.89 }, { id: 5, score: 0.86 }, { id: 2, score: 0.81 }, { id: 7, score: 0.52 }],
    reranked: [{ id: 1, score: 0.94 }, { id: 5, score: 0.91 }, { id: 2, score: 0.77 }],
    contextTokens: 1184,
    questionTokens: 9,
    answer: 'He built Clausify, an LLM pipeline that flags risky contract clauses [1], and this site\'s tool-calling assistant on gpt-4o-mini [5].',
  },
  {
    question: 'Which frontend frameworks does he ship with?',
    at: { x: 44, y: 58 },
    retrieved: [{ id: 3, score: 0.88 }, { id: 4, score: 0.79 }, { id: 2, score: 0.61 }, { id: 5, score: 0.55 }],
    reranked: [{ id: 3, score: 0.95 }, { id: 4, score: 0.83 }],
    contextTokens: 742,
    questionTokens: 10,
    answer: 'Angular and React, on Django backends at Indeeya [3]. His npm package CommitGrid is a React component [4].',
  },
  {
    question: 'Does he care about security?',
    at: { x: 92, y: 100 },
    retrieved: [{ id: 7, score: 0.87 }, { id: 6, score: 0.82 }, { id: 5, score: 0.58 }, { id: 3, score: 0.51 }],
    reranked: [{ id: 7, score: 0.93 }, { id: 6, score: 0.88 }],
    contextTokens: 655,
    questionTokens: 7,
    answer: 'Yes. He came up through cybersecurity [7] and built Void Vault, encrypted cloud storage [6].',
  },
];

const STAGES = ['Embed', 'Retrieve', 'Rerank', 'Augment', 'Generate'] as const;
// Stage indices: 0 typing the question, 1–5 the STAGES above, 6 holding the answer
const STAGE_MS: Record<number, number> = { 1: 1100, 2: 1500, 3: 1300, 4: 1100 };
const TYPE_MS = 32;
const WORD_MS = 75;
const HOLD_MS = 2800;
const SYSTEM_TOKENS = 212;
const DIMS = 32;
const EASE = [0.22, 1, 0.36, 1] as const;

const chunk = (id: number) => CHUNKS.find((c) => c.id === id)!;

// Seeded PRNG so each question always gets the same embedding bars
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Faint background points: the rest of the corpus
const NOISE = (() => {
  const rand = seeded(7);
  return Array.from({ length: 46 }, () => ({ x: 6 + rand() * 188, y: 6 + rand() * 118 }));
})();

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">{children}</p>;
}

export function RagPipeline({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduced = useReducedMotion();

  const [qi, setQi] = useState(0);
  const [stage, setStage] = useState(0);
  const [typed, setTyped] = useState(0);
  const [words, setWords] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  const q = QUERIES[qi];
  const answerWords = useMemo(() => q.answer.split(' '), [q]);

  // Reduce Motion: a still, finished trace of the first question
  const s = reduced ? 6 : stage;
  const shownQuestion = reduced ? q.question : q.question.slice(0, typed);
  const shownWords = reduced ? answerWords.length : words;

  useEffect(() => {
    if (!inView || reduced) return;
    let timer: number;
    if (stage === 0) {
      timer = window.setTimeout(() => (typed < q.question.length ? setTyped(typed + 1) : setStage(1)), typed < q.question.length ? TYPE_MS : 350);
    } else if (stage === 5) {
      timer = window.setTimeout(() => (words < answerWords.length ? setWords(words + 1) : setStage(6)), words < answerWords.length ? WORD_MS : 300);
    } else if (stage === 6) {
      timer = window.setTimeout(() => {
        setQi((qi + 1) % QUERIES.length);
        setStage(0);
        setTyped(0);
        setWords(0);
      }, HOLD_MS);
    } else {
      timer = window.setTimeout(() => setStage(stage + 1), STAGE_MS[stage]);
    }
    return () => window.clearTimeout(timer);
  }, [inView, reduced, stage, typed, words, qi, q, answerWords]);

  const vector = useMemo(() => {
    const rand = seeded(qi + 11);
    return Array.from({ length: DIMS }, () => rand() * 2 - 1);
  }, [qi]);

  const list = s >= 3 ? q.reranked : s >= 2 ? q.retrieved : [];
  const kept = new Set(q.reranked.map((r) => r.id));
  // Chunks the answer has cited so far light up with their citation
  const cited = new Set(
    answerWords.slice(0, shownWords).flatMap((w) => {
      const m = w.match(/^\[(\d)\]/);
      return m ? [Number(m[1])] : [];
    }),
  );
  const lit = (id: number) => hovered === id || (hovered === null && cited.has(id));

  return (
    <div ref={ref} className={className}>
      <p className="sr-only">
        An animated diagram of a retrieval-augmented generation pipeline answering questions about my work: the question
        is embedded, the closest chunks of my portfolio are retrieved and reranked, packed into the prompt, and the
        answer is generated with citations.
      </p>
      <div aria-hidden className="rounded-2xl hairline bg-surface/50 p-4 md:p-5">
        {/* Header: pipeline stages */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">RAG pipeline · trace</p>
          <ol className="flex flex-wrap gap-1">
            {STAGES.map((name, i) => {
              const n = i + 1;
              const state = s === n ? 'active' : s > n ? 'done' : 'todo';
              return (
                <li
                  key={name}
                  className={`rounded-md px-2 py-0.5 font-mono text-[10px] transition-colors duration-300 ${
                    state === 'active' ? 'bg-accent text-on-accent' : state === 'done' ? 'bg-fg/[0.08] text-fg/80' : 'text-muted/70'
                  }`}
                >
                  {n} {name}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Query */}
        <div className="mt-4 rounded-xl bg-bg px-3.5 py-2.5 ring-1 ring-edge">
          <span className="font-mono text-[10px] text-muted">query › </span>
          <span className="text-[14px] text-fg">{shownQuestion}</span>
          {s === 0 && <span className="caret ml-px inline-block h-[1em] w-px translate-y-[2px] bg-fg" />}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* Left: embedding + vector space */}
          <div>
            <Label>Embedding · {DIMS} of 1,536 dims</Label>
            <div className="flex h-10 items-center gap-[2px]">
              {vector.map((v, i) => (
                <motion.span
                  key={`${qi}-${i}`}
                  className="w-full rounded-[1px] bg-accent"
                  initial={false}
                  animate={{ height: s >= 1 ? `${Math.max(8, Math.abs(v) * 100)}%` : '8%', opacity: s >= 1 ? 0.3 + Math.abs(v) * 0.7 : 0.15 }}
                  transition={{ duration: 0.5, ease: EASE, delay: s === 1 ? i * 0.018 : 0 }}
                />
              ))}
            </div>

            <div className="mt-4">
              <Label>Vector space · top k = 4</Label>
              <svg viewBox="0 0 200 130" className="w-full rounded-xl bg-bg ring-1 ring-edge">
                {NOISE.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={1.1} fill="rgb(var(--fg) / 0.14)" />
                ))}
                {/* Similarity lines from the question to the retrieved chunks */}
                {s >= 2 &&
                  q.retrieved.map((r) => {
                    const c = chunk(r.id);
                    const dropped = s >= 3 && !kept.has(r.id);
                    return (
                      <g key={`${qi}-${r.id}`}>
                        <motion.line
                          x1={q.at.x} y1={q.at.y} x2={c.x} y2={c.y}
                          stroke="rgb(var(--accent))"
                          strokeWidth={lit(r.id) ? 1.1 : 0.7}
                          strokeDasharray={dropped ? '2 2' : undefined}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: dropped ? 0.25 : 0.8 }}
                          transition={{ duration: 0.6, ease: EASE }}
                        />
                      </g>
                    );
                  })}
                {CHUNKS.map((c) => {
                  const inPlay = s >= 2 && q.retrieved.some((r) => r.id === c.id) && !(s >= 3 && !kept.has(c.id));
                  return (
                    <g key={c.id}>
                      <motion.circle
                        cx={c.x} cy={c.y}
                        fill="rgb(var(--accent))"
                        initial={false}
                        animate={{ r: lit(c.id) ? 4.6 : inPlay ? 3.4 : 2.4, opacity: inPlay ? 1 : 0.45 }}
                        transition={{ duration: 0.3 }}
                      />
                      <text x={c.x + 5} y={c.y + 2} fontSize="6" fontFamily="ui-monospace, monospace" fill="rgb(var(--fg) / 0.55)">
                        {c.id}
                      </text>
                    </g>
                  );
                })}
                {/* The question's embedding */}
                <AnimatePresence>
                  {s >= 2 && (
                    <motion.g key={qi} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ transformOrigin: `${q.at.x}px ${q.at.y}px` }}>
                      <circle cx={q.at.x} cy={q.at.y} r={7} fill="none" stroke="rgb(var(--fg))" strokeWidth={0.6} opacity={0.35} />
                      <circle cx={q.at.x} cy={q.at.y} r={2.6} fill="rgb(var(--fg))" />
                    </motion.g>
                  )}
                </AnimatePresence>
              </svg>
            </div>
          </div>

          {/* Right: retrieved / reranked context */}
          <div>
            <Label>{s >= 3 ? `Reranked · kept ${q.reranked.length}` : 'Retrieved chunks · cosine'}</Label>
            <div className="flex min-h-[260px] flex-col gap-1.5">
              {list.length === 0 && <p className="text-[12px] text-muted/70">Waiting for the query embedding…</p>}
              <AnimatePresence mode="popLayout" initial={false}>
                {list.map((r, i) => {
                  const c = chunk(r.id);
                  const inContext = s >= 4;
                  return (
                    <motion.div
                      key={`${qi}-${r.id}`}
                      layout
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12, transition: { duration: 0.25 } }}
                      transition={{ duration: 0.45, ease: EASE, delay: s === 2 ? i * 0.12 : 0 }}
                      onPointerEnter={() => setHovered(r.id)}
                      onPointerLeave={() => setHovered(null)}
                      className={`rounded-lg px-3 py-2 ring-1 transition-colors duration-300 ${
                        lit(r.id) ? 'bg-accent/10 ring-accent' : inContext ? 'bg-bg ring-accent/40' : 'bg-bg ring-edge'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-accent">[{c.id}]</span>
                        <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted">{c.source}</span>
                        <span className="h-1 w-12 overflow-hidden rounded-full bg-fg/10">
                          <motion.span
                            className="block h-full rounded-full bg-accent"
                            initial={false}
                            animate={{ width: `${r.score * 100}%` }}
                            transition={{ duration: 0.5, ease: EASE }}
                          />
                        </span>
                        <span className="w-7 text-right font-mono text-[10px] tabular-nums text-fg/80">{r.score.toFixed(2)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-fg/80">{c.text}</p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Prompt assembly */}
            <div className={`mt-3 transition-opacity duration-300 ${s >= 4 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex h-1.5 overflow-hidden rounded-full bg-fg/10">
                {[
                  { n: SYSTEM_TOKENS, c: 'bg-fg/40' },
                  { n: q.contextTokens, c: 'bg-accent' },
                  // The query is only a few tokens; drawn wider so it stays visible
                  { n: q.questionTokens * 8, c: 'bg-fg' },
                ].map((part, i) => (
                  <motion.span
                    key={i}
                    className={part.c}
                    initial={false}
                    animate={{ width: s >= 4 ? `${(part.n / 2000) * 100}%` : '0%' }}
                    transition={{ duration: 0.6, ease: EASE, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <p className="mt-1.5 min-h-[2.6em] font-mono text-[10px] text-muted">
                prompt = system {SYSTEM_TOKENS} + context {q.contextTokens.toLocaleString()} + query {q.questionTokens} ={' '}
                <span className="text-fg/80">{(SYSTEM_TOKENS + q.contextTokens + q.questionTokens).toLocaleString()} tokens</span>
              </p>
            </div>
          </div>
        </div>

        {/* Generation */}
        <div className="mt-4 min-h-[76px] rounded-xl bg-bg px-3.5 py-3 ring-1 ring-edge">
          <Label>Answer · grounded in {q.reranked.length} chunks</Label>
          <p className="text-[14px] leading-relaxed text-fg">
            {s < 5 && <span className="text-muted/70">—</span>}
            {s >= 5 &&
              answerWords.slice(0, shownWords).map((w, i) => {
                const m = w.match(/^\[(\d)\](.*)$/);
                if (!m) return <span key={i}>{w} </span>;
                const id = Number(m[1]);
                return (
                  <span key={i}>
                    <span
                      onPointerEnter={() => setHovered(id)}
                      onPointerLeave={() => setHovered(null)}
                      className="mx-0.5 inline-block cursor-default rounded bg-accent/15 px-1 font-mono text-[11px] text-accent"
                    >
                      {m[1]}
                    </span>
                    {m[2]}{' '}
                  </span>
                );
              })}
            {s === 5 && <span className="caret ml-px inline-block h-[1em] w-px translate-y-[2px] bg-fg" />}
          </p>
        </div>

        <p className="mt-3 font-mono text-[10px] text-muted/70">Illustrative trace over my own portfolio content · hover a chunk or citation</p>
      </div>
    </div>
  );
}
