import { isComment, readList, writeList } from './storage.ts';
import type { Comment } from './types.ts';

export interface NewComment {
  clientId: string;
  text: string;
}

export interface CommentsApi {
  postComment: (comment: NewComment, signal?: AbortSignal) => Promise<Comment>;
  listComments: (signal?: AbortSignal) => Promise<Comment[]>;
}

export interface ServerOptions {
  storageKey?: string;
  failureRate?: number;
  random?: () => number;
  latencyMs?: () => number;
  now?: () => number;
}

export const SERVER_STORAGE_KEY = 'comments.server';

function randomLatency(): number {
  return 1000 + Math.random() * 1000;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(new DOMException('Request aborted', 'AbortError'));
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export function createCommentsServer({
  storageKey = SERVER_STORAGE_KEY,
  failureRate = 0.2,
  random = Math.random,
  latencyMs = randomLatency,
  now = Date.now,
}: ServerOptions = {}): CommentsApi {
  const fails = () => random() < failureRate;

  async function postComment({ clientId, text }: NewComment, signal?: AbortSignal) {
    await wait(latencyMs(), signal);
    const stored = readList(storageKey, isComment);
    const existing = stored.find((comment) => comment.clientId === clientId);
    const comment = existing ?? { clientId, text, createdAt: now() };
    if (!existing) {
      writeList(storageKey, [...stored, comment]);
    }
    if (fails()) {
      throw new Error('Network error: the response was lost');
    }
    return comment;
  }

  async function listComments(signal?: AbortSignal) {
    await wait(latencyMs(), signal);
    if (fails()) {
      throw new Error('Could not load comments');
    }
    return readList(storageKey, isComment);
  }

  return { postComment, listComments };
}

export const commentsApi = createCommentsServer();
