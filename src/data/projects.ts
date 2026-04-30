export interface PersonalProject {
  name: string;
  tag: string;
  description: string;
  tech: string[];
  link: string | null;
  linkLabel: string;
  void?: boolean;
  video?: string;
}

export interface ProfessionalCard {
  title: string;
  description: string;
}

export const PERSONAL_PROJECTS: PersonalProject[] = [
  {
    name: 'VOID VAULT',
    tag: 'Personal Project',
    description:
      'Personal cloud storage app using Discord as a file backend. Files are client-encrypted in the browser via AES-256-GCM (PBKDF2 key derivation), then server-encrypted with a second AES-256-GCM layer before being split into 25MB chunks and uploaded across up to 5 Discord bots in parallel for maximum throughput. Metadata stored in MongoDB. Features JWT auth with silent refresh, httpOnly cookie refresh tokens, Google OAuth, shareable links with expiry and password protection, and a Next.js frontend with upload, browse, download, rename, and delete.',
    tech: ['Next.js', 'Node.js', 'Express', 'MongoDB', 'Discord.js', 'AES-256-GCM', 'JWT'],
    link: null,
    linkLabel: 'Private Repo',
    void: true,
    video: '/media/void-vault.mp4',
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
