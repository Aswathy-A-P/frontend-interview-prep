import {
  enqueue,
  markFailed,
  markQueued,
  markSending,
  markSent,
  mergeComments,
  nextToSend,
  requeueInterrupted,
  withoutConfirmed,
} from './outbox.ts';
import { isOutboxItem, readList } from './storage.ts';
import type { OutboxItem } from './types.ts';

function item(clientId: string): Omit<OutboxItem, 'status'> {
  return { clientId, text: `text ${clientId}`, createdAt: 1 };
}

describe('outbox helpers', () => {
  it('enqueues items as queued, in order', () => {
    const outbox = enqueue(enqueue([], item('a')), item('b'));
    expect(outbox.map((entry) => [entry.clientId, entry.status.kind])).toEqual([
      ['a', 'queued'],
      ['b', 'queued'],
    ]);
  });

  it('picks the oldest queued item as next to send', () => {
    const outbox = markFailed(enqueue(enqueue([], item('a')), item('b')), 'a', 'boom');
    expect(nextToSend(outbox)?.clientId).toBe('b');
  });

  it('sends nothing while another item is sending', () => {
    const outbox = markSending(enqueue(enqueue([], item('a')), item('b')), 'a');
    expect(nextToSend(outbox)).toBeUndefined();
  });

  it('removes an item once it is sent', () => {
    const outbox = markSent(enqueue(enqueue([], item('a')), item('b')), 'a');
    expect(outbox.map((entry) => entry.clientId)).toEqual(['b']);
  });

  it('marks an item failed with its error, and queues it again for a retry', () => {
    const failed = markFailed(enqueue([], item('a')), 'a', 'boom');
    expect(failed[0]?.status).toEqual({ kind: 'failed', error: 'boom' });
    expect(markQueued(failed, 'a')[0]?.status).toEqual({ kind: 'queued' });
  });

  it('re-queues items that were interrupted mid-send', () => {
    const outbox = requeueInterrupted(markSending(enqueue([], item('a')), 'a'));
    expect(outbox[0]?.status).toEqual({ kind: 'queued' });
  });

  it('merges sent comments into the loaded list without duplicates', () => {
    const a = { ...item('a') };
    const b = { ...item('b') };
    expect(mergeComments([a], [a, b])).toEqual([a, b]);
  });

  it('hides outbox items the server already confirmed', () => {
    const outbox = enqueue(enqueue([], item('a')), item('b'));
    expect(withoutConfirmed(outbox, [item('a')]).map((entry) => entry.clientId)).toEqual(['b']);
  });
});

describe('readList', () => {
  it('returns an empty list for missing or malformed data', () => {
    expect(readList('missing', isOutboxItem)).toEqual([]);
    localStorage.setItem('broken', '{not json');
    expect(readList('broken', isOutboxItem)).toEqual([]);
  });

  it('keeps only entries with a valid shape', () => {
    const valid = { ...item('a'), status: { kind: 'failed', error: 'boom' } };
    localStorage.setItem(
      'outbox',
      JSON.stringify([valid, { clientId: 1 }, { ...valid, status: {} }]),
    );
    expect(readList('outbox', isOutboxItem)).toEqual([valid]);
  });
});
