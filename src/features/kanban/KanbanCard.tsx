import { useState, type Dispatch, type DragEvent } from 'react';
import { APPEND, type BoardAction } from './boardReducer.ts';
import CardForm from './CardForm.tsx';
import { COLUMNS, DRAG_FORMAT, type Card, type ColumnId } from './types.ts';

interface KanbanCardProps {
  card: Card;
  column: ColumnId;
  index: number;
  columnSize: number;
  dispatch: Dispatch<BoardAction>;
}

const buttonClass =
  'rounded-md border border-border px-2 py-1 text-xs font-medium text-ink hover:bg-surface disabled:opacity-40';

function KanbanCard({ card, column, index, columnSize, dispatch }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  function move(toColumn: ColumnId, toIndex: number) {
    dispatch({ type: 'move', cardId: card.id, toColumn, toIndex });
  }

  function handleDragStart(event: DragEvent<HTMLLIElement>) {
    event.dataTransfer.setData(DRAG_FORMAT, card.id);
    event.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    event.stopPropagation();
    const draggedId = event.dataTransfer.getData(DRAG_FORMAT);
    if (draggedId) {
      dispatch({ type: 'move', cardId: draggedId, toColumn: column, toIndex: index });
    }
  }

  if (isEditing) {
    return (
      <li className="rounded-lg border border-accent bg-white p-3 shadow-sm">
        <CardForm
          initial={card}
          submitLabel="Save"
          onSubmit={(draft) => {
            dispatch({ type: 'edit', cardId: card.id, draft });
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li
      draggable
      onDragStart={handleDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="cursor-grab space-y-2 rounded-lg border border-border bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <h3 className="font-semibold break-words text-ink">{card.title}</h3>
      {card.description ? (
        <p className="text-sm break-words whitespace-pre-line text-muted">{card.description}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5">
        <select
          aria-label={`Move ${card.title} to column`}
          value={column}
          onChange={(event) => {
            const target = COLUMNS.find(({ id }) => id === event.target.value);
            if (target) {
              move(target.id, APPEND);
            }
          }}
          className="rounded-md border border-border bg-white px-1.5 py-1 text-xs"
        >
          {COLUMNS.map(({ id, title }) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label={`Move ${card.title} up`}
          disabled={index === 0}
          onClick={() => move(column, index - 1)}
          className={buttonClass}
        >
          Up
        </button>
        <button
          type="button"
          aria-label={`Move ${card.title} down`}
          disabled={index === columnSize - 1}
          onClick={() => move(column, index + 1)}
          className={buttonClass}
        >
          Down
        </button>
        <button
          type="button"
          aria-label={`Edit ${card.title}`}
          onClick={() => setIsEditing(true)}
          className={buttonClass}
        >
          Edit
        </button>
        <button
          type="button"
          aria-label={`Delete ${card.title}`}
          onClick={() => dispatch({ type: 'delete', cardId: card.id })}
          className={buttonClass}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default KanbanCard;
