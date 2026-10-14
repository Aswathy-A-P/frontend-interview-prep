export interface Question {
  number: number;
  title: string;
  path: string;
  summary: string;
}

export const questions: Question[] = [
  {
    number: 2,
    title: 'Infinite Feed',
    path: '/feed',
    summary: 'A post feed that loads more as you scroll and keeps your place when you come back.',
  },
];
