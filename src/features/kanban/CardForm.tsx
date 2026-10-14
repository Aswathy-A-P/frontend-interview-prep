import { useId, useState, type FormEvent } from 'react';
import type { CardDraft } from './types.ts';

interface CardFormProps {
  initial?: CardDraft;
  submitLabel: string;
  onSubmit: (draft: CardDraft) => void;
  onCancel?: () => void;
}

const EMPTY_DRAFT: CardDraft = { title: '', description: '' };

function CardForm({ initial = EMPTY_DRAFT, submitLabel, onSubmit, onCancel }: CardFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [error, setError] = useState('');
  const id = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }
    onSubmit({ title: trimmedTitle, description: description.trim() });
    setTitle('');
    setDescription('');
    setError('');
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor={`${id}-title`} className="block text-sm font-medium text-ink">
          Title
        </label>
        <input
          id={`${id}-title`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
        />
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
      <div className="space-y-1">
        <label htmlFor={`${id}-description`} className="block text-sm font-medium text-ink">
          Description (optional)
        </label>
        <textarea
          id={`${id}-description`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-strong"
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default CardForm;
