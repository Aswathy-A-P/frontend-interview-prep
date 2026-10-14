import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import Page from '../../components/ui/Page.tsx';
import LoadMoreSentinel from './LoadMoreSentinel.tsx';
import { hasReachedEnd } from './feedPaging.ts';
import { useFeedState, useFeedStore } from './feedStoreContext.ts';

function FeedPage() {
  const store = useFeedStore();
  const state = useFeedState();
  const { posts, status } = state;
  const reachedEnd = hasReachedEnd(state);

  useLayoutEffect(() => {
    window.scrollTo(0, store.savedScrollY());
  }, [store]);

  return (
    <Page title="Infinite Feed" description="Posts load as you scroll." width="md">
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              to={`/feed/${post.id}`}
              onClick={() => store.saveScrollY(window.scrollY)}
              className="block space-y-2 rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-accent hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-ink">{post.title}</h2>
              <p className="line-clamp-2 text-sm text-muted">{post.body}</p>
            </Link>
          </li>
        ))}
      </ul>

      {status.kind === 'loading' ? (
        <p role="status" className="text-center text-muted">
          Loading posts…
        </p>
      ) : null}

      {status.kind === 'error' ? (
        <div role="alert" className="space-y-3 text-center">
          <p className="text-danger">Could not load posts: {status.message}</p>
          <button
            type="button"
            onClick={store.loadMore}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Retry
          </button>
        </div>
      ) : null}

      {reachedEnd ? (
        <p className="text-center text-muted">
          {posts.length === 0 ? 'No posts yet.' : "You've reached the end."}
        </p>
      ) : null}

      {status.kind === 'idle' && !reachedEnd ? (
        <LoadMoreSentinel onVisible={store.loadMore} />
      ) : null}
    </Page>
  );
}

export default FeedPage;
