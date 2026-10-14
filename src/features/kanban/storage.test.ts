import { loadBoard, saveBoard, STORAGE_KEY } from './storage.ts';
import { EMPTY_BOARD } from './types.ts';

describe('board storage', () => {
  it('returns an empty board when nothing is stored', () => {
    expect(loadBoard()).toEqual(EMPTY_BOARD);
  });

  it('round-trips a saved board', () => {
    const board = {
      todo: [{ id: '1', title: 'Plan', description: '' }],
      inProgress: [],
      done: [],
    };
    saveBoard(board);
    expect(loadBoard()).toEqual(board);
  });

  it('ignores malformed or wrongly shaped data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadBoard()).toEqual(EMPTY_BOARD);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todo: [{ id: 1 }], inProgress: [] }));
    expect(loadBoard()).toEqual(EMPTY_BOARD);
  });
});
