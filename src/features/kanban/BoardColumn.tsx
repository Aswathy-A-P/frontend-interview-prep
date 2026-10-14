import { useId, type Dispatch, type DragEvent } from 'react';
import { APPEND, type BoardAction } from './boardReducer.ts';
import KanbanCard from './KanbanCard.tsx';
import { DRAG_FORMAT, type Card, type ColumnId } from './types.ts';

interface BoardColumnProps {
  id: ColumnId;
  title: string;
  cards: Card[];
  dispatch: Dispatch<BoardAction>;
}

function BoardColumn({ id, title, cards, dispatch }: BoardColumnProps) {
  const headingId = useId();
  const count = cards.length;

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData(DRAG_FORMAT);
    if (draggedId) {
      dispatch({ type: 'move', cardId: draggedId, toColumn: id, toIndex: APPEND });
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="flex min-h-64 flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <header className="flex items-baseline justify-between">
        <h2 id={headingId} className="text-lg font-semibold text-ink">
          {title}
        </h2>
        <p className="text-sm text-muted">
          {count} {count === 1 ? 'card' : 'cards'}
        </p>
      </header>
      {count === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted">
          No cards yet. Drop one here.
        </p>
      ) : (
        <ul className="space-y-3">
          {cards.map((card, index) => (
            <KanbanCard
              key={card.id}
              card={card}
              column={id}
              index={index}
              columnSize={count}
              dispatch={dispatch}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default BoardColumn;
