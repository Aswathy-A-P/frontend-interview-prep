export interface Question {
  number: number;
  title: string;
  path: string;
  summary: string;
}

export const questions: Question[] = [
  {
    number: 4,
    title: 'Live Dashboard',
    path: '/dashboard',
    summary:
      'A self-refreshing dashboard that pauses while the tab is hidden and remembers which widgets you show.',
  },
];
