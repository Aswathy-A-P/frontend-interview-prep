import { useEffect, useReducer } from 'react';
import Page from '../../components/ui/Page.tsx';
import BoardColumn from './BoardColumn.tsx';
import { boardReducer } from './boardReducer.ts';
import CardForm from './CardForm.tsx';
import { loadBoard, saveBoard } from './storage.ts';
import { COLUMNS } from './types.ts';

function KanbanPage() {
  const [board, dispatch] = useReducer(boardReducer, undefined, loadBoard);

  useEffect(() => {
    saveBoard(board);
  }, [board]);

  return (
    <Page
      title="Kanban Board"
      description="Drag cards between columns, or use each card's controls to move them with the keyboard."
      width="xl"
    >
      <section
        aria-labelledby="kanban-add-heading"
        className="mx-auto max-w-md rounded-xl border border-border bg-white p-4 shadow-sm"
      >
        <h2 id="kanban-add-heading" className="mb-3 text-lg font-semibold text-ink">
          Add a card to To do
        </h2>
        <CardForm
          submitLabel="Add card"
          onSubmit={(draft) =>
            dispatch({ type: 'add', id: crypto.randomUUID(), column: 'todo', draft })
          }
        />
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map(({ id, title }) => (
          <BoardColumn key={id} id={id} title={title} cards={board[id]} dispatch={dispatch} />
        ))}
      </div>
    </Page>
  );
}

export default KanbanPage;
