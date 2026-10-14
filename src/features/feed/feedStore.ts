import { fetchPostsPage } from './feedApi.ts';
import { applyPage, hasReachedEnd, initialFeedState, type FeedState } from './feedPaging.ts';

export interface FeedStore {
  getState: () => FeedState;
  subscribe: (listener: () => void) => () => void;
  loadMore: () => void;
  abort: () => void;
  savedScrollY: () => number;
  saveScrollY: (scrollY: number) => void;
}

export function createFeedStore(fetchPage = fetchPostsPage): FeedStore {
  let state = initialFeedState;
  let inFlight: AbortController | null = null;
  let scrollY = 0;
  const loadedSkips = new Set<number>();
  const listeners = new Set<() => void>();

  function setState(next: FeedState) {
    state = next;
    listeners.forEach((listener) => listener());
  }

  async function loadMore() {
    const skip = state.nextSkip;
    if (inFlight !== null || hasReachedEnd(state) || loadedSkips.has(skip)) return;

    const controller = new AbortController();
    inFlight = controller;
    setState({ ...state, status: { kind: 'loading' } });

    try {
      const page = await fetchPage(skip, controller.signal);
      loadedSkips.add(skip);
      setState(applyPage(state, page));
    } catch (error) {
      if (controller.signal.aborted) {
        setState({ ...state, status: { kind: 'idle' } });
      } else {
        const message = error instanceof Error ? error.message : 'Something went wrong';
        setState({ ...state, status: { kind: 'error', message } });
      }
    } finally {
      if (inFlight === controller) inFlight = null;
    }
  }

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    loadMore: () => void loadMore(),
    abort: () => inFlight?.abort(),
    savedScrollY: () => scrollY,
    saveScrollY: (next) => {
      scrollY = next;
    },
  };
}
