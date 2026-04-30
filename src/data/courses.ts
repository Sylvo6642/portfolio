export interface Course {
  title: string;
  org: string;
  period: string;
}

export const COURSES: Course[] = [
  { title: 'Machine Learning', org: 'Coursera', period: 'Aug 2025 – Present' },
  { title: 'Python Full Stack Developer', org: 'Techolas Technologies', period: 'Jan – Sep 2023' },
  { title: 'Red Team CICSA Analyst', org: 'Red Team', period: 'May – Dec 2022' },
];

export const BLOG_POSTS: { title: string; tag: string }[] = [
  { title: 'Thread-Safe Label Generation with MongoDB Atomic Counters', tag: 'engineering' },
  { title: 'Eliminating N+1 Queries in Django + MongoDB', tag: 'performance' },
  { title: 'How I Automate My Dev Workflow with Bash Scripts', tag: 'tooling' },
];
