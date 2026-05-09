export interface PersonalProject {
  name: string;
  tag: string;
  description: string;
  tech: string[];
  link: string | null;
  linkLabel: string;
  liveUrl?: string;
  void?: boolean;
  skilldash?: boolean;
  spendwise?: boolean;
  video?: string;
}

export interface ProfessionalCard {
  title: string;
  description: string;
}

export const PERSONAL_PROJECTS: PersonalProject[] = [
  {
    name: 'SPENDWISE',
    tag: 'In Development',
    description:
      'A quieter way to track money — an editorial-warm personal expense tracker. Cream parchment palette with walnut ink, burnished amber accents, and Fraunces serif numerals. Email/password and Google OAuth via Supabase, with a Postgres trigger that auto-seeds a profile and seven default categories on signup. Animated dashboard with count-up stat cards, donut and 6-month bar charts (Recharts), expense ledger with month + category filters, category cards with budget progress bars and an over-budget pulse-glow. Row-Level Security on every table, dark mode persisted to localStorage, custom hand-drawn SVG empty-state illustrations, and Framer Motion page transitions throughout.',
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Framer Motion', 'Recharts', 'Supabase', 'Postgres', 'RLS', 'React Hook Form', 'Zod'],
    link: 'https://github.com/Sylvo6642/SpendWise',
    linkLabel: 'GitHub',
    liveUrl: '/projects/SpendWise/',
    spendwise: true,
  },
  {
    name: 'VOID VAULT',
    tag: 'Personal Project',
    description:
      'Personal cloud storage app using Discord as a file backend. Files are client-encrypted in the browser via AES-256-GCM (PBKDF2 key derivation), then server-encrypted with a second AES-256-GCM layer before being split into 25MB chunks and uploaded across up to 5 Discord bots in parallel for maximum throughput. Metadata stored in MongoDB. Features JWT auth with silent refresh, httpOnly cookie refresh tokens, Google OAuth, shareable links with expiry and password protection, and a Next.js frontend with upload, browse, download, rename, and delete.',
    tech: ['Next.js', 'Node.js', 'Express', 'MongoDB', 'Discord.js', 'AES-256-GCM', 'JWT'],
    link: 'https://github.com/Sylvo6642/Void-Vault',
    linkLabel: 'GitHub',
    void: true,
    video: '/media/void-vault.mp4',
  },
  {
    name: 'SKILLDASH',
    tag: 'In Development',
    description:
      'Skilled hands, one tap away — a platform connecting customers with manual-labor workers across India (handymen, plumbers, electricians, cooks, and more). Customers post jobs, browse local workers on a live map, and pay on assignment; workers bid, manage jobs, and stream live location updates via Supabase Realtime. Built on a Postgres schema with Row-Level Security, auto-provisioned profiles via auth triggers, a payment-on-assign trigger, and three Supabase Edge Functions handling assignment, payout, and notification fan-out. Auth supports email/password and phone OTP, with dual-role switching between customer and worker dashboards.',
    tech: ['React', 'Vite', 'Tailwind', 'Framer Motion', 'Supabase', 'Postgres', 'Edge Functions', 'Zustand', 'React Router', 'Leaflet'],
    link: 'https://github.com/Sylvo6642/SkillDash/',
    linkLabel: 'GitHub',
    liveUrl: '/projects/SkillDash/',
    skilldash: true,
    video: '/media/skilldash.mp4',
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
