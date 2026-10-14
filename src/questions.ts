export interface Question {
  number: number;
  title: string;
  path: string;
  summary: string;
}

export const questions: Question[] = [
  {
    number: 1,
    title: 'Shopping Cart',
    path: '/cart',
    summary: 'Add products to a persisted cart with stock-limited quantities and 18% tax totals.',
  },
  {
    number: 2,
    title: 'Infinite Feed',
    path: '/feed',
    summary: 'A post feed that loads more as you scroll and keeps your place when you come back.',
  },
  {
    number: 3,
    title: 'Kanban Board',
    path: '/kanban',
    summary: 'Add, edit and move cards across three columns by drag and drop or keyboard.',
  },
  {
    number: 4,
    title: 'Live Dashboard',
    path: '/dashboard',
    summary:
      'A self-refreshing dashboard that pauses while the tab is hidden and remembers which widgets you show.',
  },
];
