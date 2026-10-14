import type { Board, Card, CardDraft, ColumnId } from './types.ts';
import { COLUMNS } from './types.ts';

export type BoardAction =
  | { type: 'add'; id: string; column: ColumnId; draft: CardDraft }
  | { type: 'edit'; cardId: string; draft: CardDraft }
  | { type: 'delete'; cardId: string }
  | { type: 'move'; cardId: string; toColumn: ColumnId; toIndex: number };

export const APPEND = Number.POSITIVE_INFINITY;

export interface CardLocation {
  column: ColumnId;
  index: number;
}

export function findCard(board: Board, cardId: string): CardLocation | null {
  for (const { id } of COLUMNS) {
    const index = board[id].findIndex((card) => card.id === cardId);
    if (index !== -1) {
      return { column: id, index };
    }
  }
  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function moveCard(board: Board, cardId: string, toColumn: ColumnId, toIndex: number): Board {
  const from = findCard(board, cardId);
  const card = from ? board[from.column][from.index] : undefined;
  if (!from || !card) {
    return board;
  }
  const source = board[from.column].filter((c) => c.id !== cardId);
  const target = from.column === toColumn ? source : [...board[toColumn]];
  const index = clamp(toIndex, 0, target.length);
  if (from.column === toColumn && from.index === index) {
    return board;
  }
  target.splice(index, 0, card);
  return { ...board, [from.column]: source, [toColumn]: target };
}

function updateCard(board: Board, cardId: string, update: (card: Card) => Card | null): Board {
  const location = findCard(board, cardId);
  if (!location) {
    return board;
  }
  const cards = board[location.column].flatMap((card) => {
    if (card.id !== cardId) {
      return [card];
    }
    const updated = update(card);
    return updated ? [updated] : [];
  });
  return { ...board, [location.column]: cards };
}

export function boardReducer(board: Board, action: BoardAction): Board {
  switch (action.type) {
    case 'add':
      return {
        ...board,
        [action.column]: [...board[action.column], { id: action.id, ...action.draft }],
      };
    case 'edit':
      return updateCard(board, action.cardId, (card) => ({ ...card, ...action.draft }));
    case 'delete':
      return updateCard(board, action.cardId, () => null);
    case 'move':
      return moveCard(board, action.cardId, action.toColumn, action.toIndex);
  }
}
