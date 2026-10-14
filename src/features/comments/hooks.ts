import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { CommentsApi } from './commentsApi.ts';
import type { OutboxStore } from './outboxStore.ts';
import type { Comment } from './types.ts';

export type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; comments: Comment[] };

function subscribeToNetwork(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeToNetwork,
    () => navigator.onLine,
    () => true,
  );
}

export function useOutbox(store: OutboxStore) {
  useEffect(() => {
    const drain = () => void store.drain();
    drain();
    window.addEventListener('online', drain);
    return () => window.removeEventListener('online', drain);
  }, [store]);

  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

export function useCommentList(api: CommentsApi) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api.listComments(controller.signal).then(
      (comments) => setState({ status: 'success', comments }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          const message = error instanceof Error ? error.message : 'Could not load comments';
          setState({ status: 'error', message });
        }
      },
    );
    return () => controller.abort();
  }, [api, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((count) => count + 1);
  }, []);

  return { state, reload };
}
