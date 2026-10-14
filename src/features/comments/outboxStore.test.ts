import { createCommentsServer } from './commentsApi.ts';
import { createOutboxStore, OUTBOX_STORAGE_KEY } from './outboxStore.ts';

function instantApi() {
  return createCommentsServer({ random: () => 1, latencyMs: () => 0 });
}

describe('outbox store', () => {
  it('keeps queued comments in storage across a reload', () => {
    const api = instantApi();
    createOutboxStore({ api, isOnline: () => false, createId: () => 'a' }).add('Hello');
    const reloaded = createOutboxStore({ api, isOnline: () => false });
    expect(reloaded.getState().outbox).toEqual([
      expect.objectContaining({ clientId: 'a', text: 'Hello', status: { kind: 'queued' } }),
    ]);
  });

  it('re-queues a comment that was sending when the page closed', () => {
    localStorage.setItem(
      OUTBOX_STORAGE_KEY,
      JSON.stringify([{ clientId: 'a', text: 'Hi', createdAt: 1, status: { kind: 'sending' } }]),
    );
    const store = createOutboxStore({ api: instantApi(), isOnline: () => false });
    expect(store.getState().outbox[0]?.status).toEqual({ kind: 'queued' });
  });

  it('sends one item at a time, in order, even when drained repeatedly', async () => {
    const api = instantApi();
    const inFlight: string[] = [];
    let maxConcurrent = 0;
    const postComment = api.postComment;
    api.postComment = async (comment) => {
      inFlight.push(comment.clientId);
      maxConcurrent = Math.max(maxConcurrent, inFlight.length);
      const result = await postComment(comment);
      inFlight.splice(inFlight.indexOf(comment.clientId), 1);
      return result;
    };
    let online = false;
    const ids = ['a', 'b', 'c'];
    const store = createOutboxStore({
      api,
      isOnline: () => online,
      createId: () => ids.shift() ?? 'x',
    });
    store.add('one');
    store.add('two');
    store.add('three');
    online = true;
    await Promise.all([store.drain(), store.drain(), store.drain()]);
    await vi.waitFor(() => expect(store.getState().outbox).toEqual([]));
    expect(maxConcurrent).toBe(1);
    expect(store.getState().sent.map((comment) => comment.text)).toEqual(['one', 'two', 'three']);
  });
});
