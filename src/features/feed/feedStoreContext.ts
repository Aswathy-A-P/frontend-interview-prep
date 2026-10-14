import { createContext, useContext, useSyncExternalStore } from 'react';
import type { FeedState } from './feedPaging.ts';
import type { FeedStore } from './feedStore.ts';

export const FeedStoreContext = createContext<FeedStore | null>(null);

export function useFeedStore(): FeedStore {
  const store = useContext(FeedStoreContext);
  if (store === null) {
    throw new Error('useFeedStore must be used inside FeedRoutes');
  }
  return store;
}

export function useFeedState(): FeedState {
  const store = useFeedStore();
  return useSyncExternalStore(store.subscribe, store.getState);
}
