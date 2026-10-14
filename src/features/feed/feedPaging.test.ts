import type { Post } from './feedApi.ts';
import { applyPage, hasReachedEnd, initialFeedState, mergePosts } from './feedPaging.ts';

function post(id: number): Post {
  return { id, title: `Post ${id}`, body: 'Body', tags: [] };
}

describe('mergePosts', () => {
  it('appends new posts and drops ids that are already present', () => {
    const merged = mergePosts([post(1), post(2)], [post(2), post(3), post(3)]);
    expect(merged.map((item) => item.id)).toEqual([1, 2, 3]);
  });
});

describe('applyPage', () => {
  it('advances the next skip by the number of posts received', () => {
    const next = applyPage(initialFeedState, { posts: [post(1), post(2)], total: 5, skip: 0 });
    expect(next.nextSkip).toBe(2);
    expect(next.total).toBe(5);
    expect(hasReachedEnd(next)).toBe(false);
  });

  it('reaches the end once every post up to the total is loaded', () => {
    const next = applyPage(
      { ...initialFeedState, posts: [post(1)], nextSkip: 1, total: 2 },
      { posts: [post(2)], total: 2, skip: 1 },
    );
    expect(hasReachedEnd(next)).toBe(true);
  });

  it('treats an empty page as the end of the feed', () => {
    const next = applyPage(initialFeedState, { posts: [], total: 30, skip: 0 });
    expect(hasReachedEnd(next)).toBe(true);
  });
});
