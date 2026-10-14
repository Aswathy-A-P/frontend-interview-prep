export interface Question {
  number: number;
  title: string;
  path: string;
  summary: string;
}

export const questions: Question[] = [
  {
    number: 5,
    title: 'Comments with Offline Support',
    path: '/comments',
    summary: 'Post comments optimistically, queue them offline and retry without duplicates.',
  },
];
