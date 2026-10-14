export type ColumnId = 'todo' | 'inProgress' | 'done';

export interface Card {
  id: string;
  title: string;
  description: string;
}

export type Board = Record<ColumnId, Card[]>;

export interface CardDraft {
  title: string;
  description: string;
}

export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To do' },
  { id: 'inProgress', title: 'In progress' },
  { id: 'done', title: 'Done' },
];

export const EMPTY_BOARD: Board = { todo: [], inProgress: [], done: [] };
