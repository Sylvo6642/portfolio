export type ProjectStatus = 'live' | 'wip' | 'private';

export interface PersonalProject {
  name: string;
  status: ProjectStatus;
  /** Short discipline line shown at the right of the work list */
  category: string;
  /** Screenshot for the hover preview; omitted when the preview is drawn in code */
  preview?: string;
  /** Backdrop behind the preview */
  previewBg: string;
  summary: string;
  highlights: string[];
  tech: string[];
  link: string | null;
  linkLabel: string;
  liveUrl?: string;
  video?: string;
  poster?: string;
  /** Kept in the data but left off the site */
  hidden?: boolean;
}

export interface ProfessionalCard {
  title: string;
  description: string;
}

export const PERSONAL_PROJECTS: PersonalProject[] = [
  {
    name: 'Clausify',
    category: 'AI Engineering · LLM Contract Analysis',
    preview: '/projects/previews/clausify.jpg',
    previewBg: '#D5DAE1',
    status: 'private',
    summary: 'AI contract risk analyzer: an LLM pipeline that flags risky clauses and explains each one in plain English.',
    highlights: [
      'Gemini 2.0 Flash behind a server-side proxy, so the API key never reaches the browser',
      'Schema-constrained JSON output at low temperature: overall risk, summary and per-clause flags the UI can always trust',
      'Prompts tailored to occupation, jurisdiction, detail level and report language for multilingual analysis',
      'pdf.js extraction, PDF report export, Google OAuth, Razorpay billing and report history on Supabase',
    ],
    tech: ['Gemini API', 'Structured Outputs', 'Prompt Engineering', 'Serverless API', 'React', 'Vite', 'Supabase', 'Razorpay', 'pdf.js', 'jsPDF'],
    link: null,
    linkLabel: 'Private',
    liveUrl: '/projects/Clausify/',
  },
  {
    name: 'CommitGrid',
    category: 'Open Source · React Component',
    previewBg: '#0D1117',
    status: 'live',
    summary: 'Animated GitHub-style contribution heatmap for React, published on npm.',
    highlights: [
      'Spring-scale entry, count-up total and a live ping on today’s cell',
      'Pulsing glow on high-activity days',
      'Themeable from a 5-step color scale or a single seed color',
    ],
    tech: ['React', 'TypeScript', 'Framer Motion', 'tsup', 'npm'],
    link: 'https://github.com/Sylvo6642/CommitGrid',
    linkLabel: 'GitHub',
    liveUrl: 'https://www.npmjs.com/package/commitgrid',
  },
  {
    name: 'SpendWise',
    category: 'Product Design & Full-Stack',
    preview: '/projects/previews/spendwise.jpg',
    previewBg: '#E9DCC6',
    hidden: true,
    status: 'wip',
    summary: 'A calm, editorial personal expense tracker.',
    highlights: [
      'Supabase auth; a Postgres trigger seeds a profile and 7 categories on signup',
      'Dashboard with donut and 6-month charts, budgets with over-budget alerts',
      'Row-Level Security on every table',
    ],
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Framer Motion', 'Recharts', 'Supabase', 'Postgres', 'RLS', 'React Hook Form', 'Zod'],
    link: 'https://github.com/Sylvo6642/SpendWise',
    linkLabel: 'GitHub',
    liveUrl: '/projects/SpendWise/',
  },
  {
    name: 'Void Vault',
    category: 'Security & Encrypted Storage',
    preview: '/projects/previews/voidvault.jpg',
    previewBg: '#16151F',
    status: 'private',
    summary: 'Encrypted personal cloud storage on a Discord backend.',
    highlights: [
      'Two layers of AES-256-GCM: in the browser, then again on the server',
      'Files split into 25 MB chunks and uploaded in parallel across 5 Discord bots',
      'Shareable links with expiry and password protection',
    ],
    tech: ['Next.js', 'Node.js', 'Express', 'MongoDB', 'Discord.js', 'AES-256-GCM', 'JWT'],
    link: null,
    linkLabel: 'Private',
    liveUrl: '/projects/VoidVault/',
    video: '/media/void-vault.mp4',
    poster: '/media/void-vault-poster.jpg',
  },
  {
    name: 'SkillDash',
    category: 'Marketplace & Full-Stack',
    preview: '/projects/previews/skilldash.jpg',
    previewBg: '#F2A93B',
    status: 'wip',
    summary: 'Connects customers with local manual-labor workers across India.',
    highlights: [
      'Live worker map with real-time locations via Supabase Realtime',
      'Job posting, worker bidding and payment on assignment',
      'Three Edge Functions for assignment, payout and notifications',
    ],
    tech: ['React', 'Vite', 'Tailwind', 'Framer Motion', 'Supabase', 'Postgres', 'Edge Functions', 'Zustand', 'React Router', 'Leaflet'],
    link: 'https://github.com/Sylvo6642/SkillDash/',
    linkLabel: 'GitHub',
    liveUrl: '/projects/SkillDash/',
    video: '/media/skilldash.mp4',
    poster: '/media/skilldash-poster.jpg',
  },
];

export const PROFESSIONAL_CARDS: ProfessionalCard[] = [
  {
    title: 'Inventory & Label Systems',
    description:
      'Atomic label generation with thread-safe counters, QR code embedding, and ReportLab PDF rendering for 4×3" inventory labels.',
  },
  {
    title: 'ERP Approval Workflows',
    description:
      'Multi-step approval pipelines with real-time badge counts, role-based access, and Django + MongoDB backends.',
  },
  {
    title: 'Resource & Reporting Dashboards',
    description:
      'Utilization tracking APIs with aggregation pipelines, N+1 query elimination, and Angular data visualizations.',
  },
  {
    title: 'API Security & Performance',
    description:
      'Identified and patched critical API vulnerabilities. Reduced MongoDB query execution time by 60% through targeted indexing.',
  },
];
