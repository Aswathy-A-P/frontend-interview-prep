import type { Board, Card } from './types.ts';
import { COLUMNS, EMPTY_BOARD } from './types.ts';

export const STORAGE_KEY = 'kanban-board';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCard(value: unknown): value is Card {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string'
  );
}

export function isBoard(value: unknown): value is Board {
  return (
    isRecord(value) &&
    COLUMNS.every(({ id }) => {
      const cards = value[id];
      return Array.isArray(cards) && cards.every(isCard);
    })
  );
}

export function loadBoard(): Board {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return EMPTY_BOARD;
    }
    const parsed: unknown = JSON.parse(raw);
    return isBoard(parsed) ? parsed : EMPTY_BOARD;
  } catch {
    return EMPTY_BOARD;
  }
}

export function saveBoard(board: Board): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    return true;
  } catch {
    return false;
  }
}
