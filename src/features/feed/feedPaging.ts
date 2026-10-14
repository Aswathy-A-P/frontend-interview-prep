import type { Post, PostsPage } from './feedApi.ts';

export type FeedStatus =
  { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string };

export interface FeedState {
  posts: Post[];
  total: number | null;
  nextSkip: number;
  status: FeedStatus;
}

export const initialFeedState: FeedState = {
  posts: [],
  total: null,
  nextSkip: 0,
  status: { kind: 'idle' },
};

export function mergePosts(existing: Post[], incoming: Post[]): Post[] {
  const seenIds = new Set(existing.map((post) => post.id));
  const fresh = incoming.filter((post) => {
    if (seenIds.has(post.id)) return false;
    seenIds.add(post.id);
    return true;
  });
  return [...existing, ...fresh];
}

export function applyPage(state: FeedState, page: PostsPage): FeedState {
  return {
    posts: mergePosts(state.posts, page.posts),
    total: page.total,
    nextSkip: page.posts.length === 0 ? page.total : page.skip + page.posts.length,
    status: { kind: 'idle' },
  };
}

export function hasReachedEnd(state: FeedState): boolean {
  return state.total !== null && state.nextSkip >= state.total;
}
