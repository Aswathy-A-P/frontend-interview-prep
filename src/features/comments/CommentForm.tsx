import { useState, type FormEvent } from 'react';

interface CommentFormProps {
  onSubmit: (text: string) => void;
}

function CommentForm({ onSubmit }: CommentFormProps) {
  const [text, setText] = useState('');
  const trimmed = text.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmed) {
      onSubmit(trimmed);
      setText('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="comment-text" className="sr-only">
        Comment
      </label>
      <input
        id="comment-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Write a comment"
        className="flex-1 rounded-lg border border-border bg-white px-3 py-2 focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={!trimmed}
        className="rounded-lg bg-accent px-4 py-2 font-medium text-white hover:bg-accent-strong disabled:opacity-50"
      >
        Post
      </button>
    </form>
  );
}

export default CommentForm;
