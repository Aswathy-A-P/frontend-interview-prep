export interface Question {
  number: number;
  title: string;
  path: string;
  summary: string;
}

export const questions: Question[] = [
  {
    number: 3,
    title: 'Kanban Board',
    path: '/kanban',
    summary: 'Add, edit and move cards across three columns by drag and drop or keyboard.',
  },
];
