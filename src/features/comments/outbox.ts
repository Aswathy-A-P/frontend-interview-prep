import type { Comment, OutboxItem, OutboxStatus } from './types.ts';

function setStatus(outbox: OutboxItem[], clientId: string, status: OutboxStatus): OutboxItem[] {
  return outbox.map((item) => (item.clientId === clientId ? { ...item, status } : item));
}

export function enqueue(outbox: OutboxItem[], item: Omit<OutboxItem, 'status'>): OutboxItem[] {
  return [...outbox, { ...item, status: { kind: 'queued' } }];
}

export function markSending(outbox: OutboxItem[], clientId: string): OutboxItem[] {
  return setStatus(outbox, clientId, { kind: 'sending' });
}

export function markFailed(outbox: OutboxItem[], clientId: string, error: string): OutboxItem[] {
  return setStatus(outbox, clientId, { kind: 'failed', error });
}

export function markQueued(outbox: OutboxItem[], clientId: string): OutboxItem[] {
  return setStatus(outbox, clientId, { kind: 'queued' });
}

export function markSent(outbox: OutboxItem[], clientId: string): OutboxItem[] {
  return outbox.filter((item) => item.clientId !== clientId);
}

export function nextToSend(outbox: OutboxItem[]): OutboxItem | undefined {
  if (outbox.some((item) => item.status.kind === 'sending')) {
    return undefined;
  }
  return outbox.find((item) => item.status.kind === 'queued');
}

export function requeueInterrupted(outbox: OutboxItem[]): OutboxItem[] {
  return outbox.map((item) =>
    item.status.kind === 'sending' ? { ...item, status: { kind: 'queued' } } : item,
  );
}

export function mergeComments(loaded: Comment[], sent: Comment[]): Comment[] {
  const known = new Set(loaded.map((comment) => comment.clientId));
  return [...loaded, ...sent.filter((comment) => !known.has(comment.clientId))];
}

export function withoutConfirmed(outbox: OutboxItem[], confirmed: Comment[]): OutboxItem[] {
  const known = new Set(confirmed.map((comment) => comment.clientId));
  return outbox.filter((item) => !known.has(item.clientId));
}
