import Page from '../../components/ui/Page.tsx';
import CommentForm from './CommentForm.tsx';
import { commentsApi, type CommentsApi } from './commentsApi.ts';
import { useCommentList, useOnlineStatus, useOutbox } from './hooks.ts';
import { mergeComments, withoutConfirmed } from './outbox.ts';
import { outboxStore, type OutboxStore } from './outboxStore.ts';
import PendingComment from './PendingComment.tsx';

interface CommentsPageProps {
  api?: CommentsApi;
  store?: OutboxStore;
}

function CommentsPage({ api = commentsApi, store = outboxStore }: CommentsPageProps) {
  const online = useOnlineStatus();
  const { outbox, sent } = useOutbox(store);
  const { state, reload } = useCommentList(api);

  const confirmed = state.status === 'success' ? mergeComments(state.comments, sent) : sent;
  const pending = withoutConfirmed(outbox, confirmed);

  return (
    <Page
      title="Comments"
      description="Comments post instantly, queue while offline and retry without duplicates."
    >
      <p role="status" className="text-center text-sm text-muted">
        {online ? 'Online' : 'Offline: new comments are queued and sent when you reconnect.'}
      </p>
      <CommentForm onSubmit={store.add} />
      {state.status === 'loading' ? <p className="text-muted">Loading comments...</p> : null}
      {state.status === 'error' ? (
        <div role="alert" className="flex items-center gap-3 text-danger">
          <span>{state.message}</span>
          <button
            type="button"
            onClick={reload}
            className="rounded-lg border border-border px-3 py-1 text-sm font-medium text-ink hover:bg-surface"
          >
            Try again
          </button>
        </div>
      ) : null}
      {state.status === 'success' && confirmed.length === 0 && pending.length === 0 ? (
        <p className="text-muted">No comments yet.</p>
      ) : null}
      <ul aria-label="Comments" className="space-y-2">
        {confirmed.map((comment) => (
          <li key={comment.clientId} className="rounded-lg border border-border bg-white p-3">
            {comment.text}
          </li>
        ))}
        {pending.map((item) => (
          <PendingComment key={item.clientId} item={item} onRetry={store.retry} />
        ))}
      </ul>
    </Page>
  );
}

export default CommentsPage;
