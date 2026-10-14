import { commentsApi, type CommentsApi } from './commentsApi.ts';
import {
  enqueue,
  markFailed,
  markQueued,
  markSending,
  markSent,
  nextToSend,
  requeueInterrupted,
} from './outbox.ts';
import { isOutboxItem, readList, writeList } from './storage.ts';
import type { Comment, OutboxItem } from './types.ts';

export const OUTBOX_STORAGE_KEY = 'comments.outbox';

export interface OutboxState {
  outbox: OutboxItem[];
  sent: Comment[];
}

export interface OutboxStore {
  getState: () => OutboxState;
  subscribe: (listener: () => void) => () => void;
  add: (text: string) => void;
  retry: (clientId: string) => void;
  drain: () => Promise<void>;
}

interface OutboxStoreOptions {
  api: CommentsApi;
  storageKey?: string;
  createId?: () => string;
  isOnline?: () => boolean;
  now?: () => number;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not send the comment';
}

export function createOutboxStore({
  api,
  storageKey = OUTBOX_STORAGE_KEY,
  createId = () => crypto.randomUUID(),
  isOnline = () => navigator.onLine,
  now = Date.now,
}: OutboxStoreOptions): OutboxStore {
  let state: OutboxState = {
    outbox: requeueInterrupted(readList(storageKey, isOutboxItem)),
    sent: [],
  };
  let draining = false;
  const listeners = new Set<() => void>();

  function setState(next: Partial<OutboxState>) {
    state = { ...state, ...next };
    writeList(storageKey, state.outbox);
    listeners.forEach((listener) => listener());
  }

  async function send({ clientId, text }: OutboxItem) {
    setState({ outbox: markSending(state.outbox, clientId) });
    try {
      const comment = await api.postComment({ clientId, text });
      setState({ outbox: markSent(state.outbox, clientId), sent: [...state.sent, comment] });
    } catch (error) {
      setState({ outbox: markFailed(state.outbox, clientId, errorMessage(error)) });
    }
  }

  async function drain() {
    if (draining) {
      return;
    }
    draining = true;
    try {
      let item = nextToSend(state.outbox);
      while (item && isOnline()) {
        await send(item);
        item = nextToSend(state.outbox);
      }
    } finally {
      draining = false;
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    add(text) {
      setState({ outbox: enqueue(state.outbox, { clientId: createId(), text, createdAt: now() }) });
      void drain();
    },
    retry(clientId) {
      setState({ outbox: markQueued(state.outbox, clientId) });
      void drain();
    },
    drain,
  };
}

export const outboxStore = createOutboxStore({ api: commentsApi });
