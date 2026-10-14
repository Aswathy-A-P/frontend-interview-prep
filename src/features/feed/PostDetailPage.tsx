import { useLayoutEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Page from '../../components/ui/Page.tsx';
import { usePost } from './usePost.ts';

const backLinkClass = 'text-sm font-medium text-accent hover:text-accent-strong';

function PostDetail({ id }: { id: number }) {
  const { result, retry } = usePost(id);

  if (result.kind === 'loading') {
    return (
      <p role="status" className="text-center text-muted">
        Loading post…
      </p>
    );
  }

  if (result.kind === 'error') {
    return (
      <div role="alert" className="space-y-3 text-center">
        <p className="text-danger">Could not load the post: {result.message}</p>
        <button
          type="button"
          onClick={retry}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong"
        >
          Retry
        </button>
      </div>
    );
  }

  const { post } = result;
  return (
    <article className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-ink">{post.title}</h2>
      <p className="text-ink">{post.body}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Tags">
        {post.tags.map((tag) => (
          <li key={tag} className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
            {tag}
          </li>
        ))}
      </ul>
    </article>
  );
}

function PostDetailPage() {
  const { postId } = useParams();
  const id = Number(postId);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Page title="Post" width="md">
      <Link to="/feed" className={backLinkClass}>
        ← Back to feed
      </Link>
      {Number.isInteger(id) && id > 0 ? (
        <PostDetail id={id} />
      ) : (
        <p className="text-center text-muted">This post does not exist.</p>
      )}
    </Page>
  );
}

export default PostDetailPage;
