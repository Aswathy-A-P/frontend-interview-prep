import { useCallback, useEffect, useState } from 'react';
import { fetchPost, type Post } from './feedApi.ts';

export type PostResult =
  { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'success'; post: Post };

interface PostRequest {
  key: string;
  result: PostResult;
}

export function usePost(id: number): { result: PostResult; retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [request, setRequest] = useState<PostRequest | null>(null);
  const key = `${id}:${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    fetchPost(id, controller.signal)
      .then((post) => setRequest({ key, result: { kind: 'success', post } }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Something went wrong';
        setRequest({ key, result: { kind: 'error', message } });
      });
    return () => controller.abort();
  }, [id, key]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);
  const result: PostResult = request?.key === key ? request.result : { kind: 'loading' };

  return { result, retry };
}
