import { boardReducer, findCard } from './boardReducer.ts';
import type { Board, Card } from './types.ts';
import { EMPTY_BOARD } from './types.ts';

function card(id: string): Card {
  return { id, title: `Card ${id}`, description: '' };
}

function ids(cards: Card[]): string[] {
  return cards.map((c) => c.id);
}

const board: Board = {
  todo: [card('a'), card('b'), card('c')],
  inProgress: [card('d')],
  done: [],
};

describe('boardReducer', () => {
  it('adds a card to the end of a column', () => {
    const next = boardReducer(EMPTY_BOARD, {
      type: 'add',
      id: 'x',
      column: 'todo',
      draft: { title: 'Write tests', description: 'Reducer first' },
    });
    expect(next.todo).toEqual([{ id: 'x', title: 'Write tests', description: 'Reducer first' }]);
  });

  it('edits a card in place', () => {
    const next = boardReducer(board, {
      type: 'edit',
      cardId: 'b',
      draft: { title: 'Renamed', description: 'New' },
    });
    expect(next.todo[1]).toEqual({ id: 'b', title: 'Renamed', description: 'New' });
    expect(ids(next.todo)).toEqual(['a', 'b', 'c']);
  });

  it('deletes a card', () => {
    const next = boardReducer(board, { type: 'delete', cardId: 'd' });
    expect(next.inProgress).toHaveLength(0);
    expect(next.todo).toBe(board.todo);
  });

  it('moves a card to another column and updates both counts', () => {
    const next = boardReducer(board, {
      type: 'move',
      cardId: 'a',
      toColumn: 'inProgress',
      toIndex: 0,
    });
    expect(ids(next.todo)).toEqual(['b', 'c']);
    expect(ids(next.inProgress)).toEqual(['a', 'd']);
    expect(next.todo).toHaveLength(2);
    expect(next.inProgress).toHaveLength(2);
    expect(board.todo).toHaveLength(3);
  });

  it('reorders a card within a column', () => {
    const down = boardReducer(board, { type: 'move', cardId: 'a', toColumn: 'todo', toIndex: 2 });
    expect(ids(down.todo)).toEqual(['b', 'c', 'a']);
    const up = boardReducer(board, { type: 'move', cardId: 'c', toColumn: 'todo', toIndex: 0 });
    expect(ids(up.todo)).toEqual(['c', 'a', 'b']);
  });

  it('clamps the target index to the column bounds', () => {
    const next = boardReducer(board, { type: 'move', cardId: 'd', toColumn: 'done', toIndex: 99 });
    expect(ids(next.done)).toEqual(['d']);
  });

  it('returns the same board for a no-op or unknown card', () => {
    expect(boardReducer(board, { type: 'move', cardId: 'b', toColumn: 'todo', toIndex: 1 })).toBe(
      board,
    );
    expect(boardReducer(board, { type: 'delete', cardId: 'missing' })).toBe(board);
  });

  it('finds where a card lives', () => {
    expect(findCard(board, 'c')).toEqual({ column: 'todo', index: 2 });
    expect(findCard(board, 'missing')).toBeNull();
  });
});
