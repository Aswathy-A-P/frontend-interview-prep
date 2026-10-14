import { createCommentsServer } from './commentsApi.ts';

const instant = () => 0;

describe('mock comments server', () => {
  it('stores a comment and lists it', async () => {
    const api = createCommentsServer({ random: () => 1, latencyMs: instant });
    const posted = await api.postComment({ clientId: 'a', text: 'Hello' });
    expect(posted).toMatchObject({ clientId: 'a', text: 'Hello' });
    await expect(api.listComments()).resolves.toEqual([posted]);
  });

  it('returns the existing comment when the same clientId is posted again', async () => {
    const api = createCommentsServer({ random: () => 1, latencyMs: instant });
    const first = await api.postComment({ clientId: 'a', text: 'Hello' });
    const second = await api.postComment({ clientId: 'a', text: 'Hello' });
    expect(second).toEqual(first);
    await expect(api.listComments()).resolves.toHaveLength(1);
  });

  it('does not duplicate a comment when a failed post is retried', async () => {
    const outcomes = [0, 1, 1];
    const api = createCommentsServer({ random: () => outcomes.shift() ?? 1, latencyMs: instant });
    await expect(api.postComment({ clientId: 'a', text: 'Hello' })).rejects.toThrow(
      'Network error',
    );
    await api.postComment({ clientId: 'a', text: 'Hello' });
    await expect(api.listComments()).resolves.toHaveLength(1);
  });

  it('stores nothing when the request is aborted', async () => {
    const api = createCommentsServer({ random: () => 1, latencyMs: instant });
    const controller = new AbortController();
    controller.abort();
    await expect(
      api.postComment({ clientId: 'a', text: 'Hello' }, controller.signal),
    ).rejects.toThrow('aborted');
    await expect(api.listComments()).resolves.toEqual([]);
  });
});
