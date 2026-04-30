export interface Experience {
  role: string;
  company: string;
  start: string;
  end: string | null;
  location: string;
  bullets: string[];
}

export const EXPERIENCE: Experience[] = [
  {
    role: 'Software Developer',
    company: 'Indeeya® (Lidex Tech)',
    start: 'Jun 2024',
    end: null,
    location: 'Kozhikode, Kerala',
    bullets: [
      'Built Angular front-end interfaces for ERP modules — inventory, billing, orders.',
      'Developed Django REST APIs and integrated MongoDB for complex data workflows.',
      'Implemented automation for purchase order generation, financial reporting, and inventory monitoring.',
      'Resolved critical bugs in approval workflows, label generation, and authentication.',
      'Mentored interns on Angular, MongoDB aggregation pipelines, and Python.',
    ],
  },
  {
    role: 'Software Developer Intern',
    company: 'Techolas Technologies',
    start: 'Jan 2023',
    end: 'Sep 2023',
    location: 'Kozhikode, Kerala',
    bullets: [
      'Built web apps using Python, Django, and Flask for backend services.',
      'Created responsive front-end pages with React, HTML, CSS, and Bootstrap.',
      'Built RESTful APIs and deployed apps on cloud platforms.',
    ],
  },
];

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parse(s: string): Date {
  const [m, y] = s.split(' ');
  return new Date(parseInt(y, 10), MONTHS[m] ?? 0, 1);
}

export function durationMonths(start: string, end: string | null): number {
  const s = parse(start);
  const e = end ? parse(end) : new Date();
  return Math.max(0, (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1);
}

export function formatDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const yPart = y > 0 ? `${y} yr${y > 1 ? 's' : ''}` : '';
  const mPart = m > 0 ? `${m} mo${m > 1 ? 's' : ''}` : '';
  return [yPart, mPart].filter(Boolean).join(' ') || '0 mo';
}
