import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import FeedPage from './FeedPage.tsx';
import PostDetailPage from './PostDetailPage.tsx';
import { createFeedStore } from './feedStore.ts';
import { FeedStoreContext } from './feedStoreContext.ts';

function FeedRoutes() {
  const [store] = useState(() => createFeedStore());

  useEffect(() => () => store.abort(), [store]);

  return (
    <FeedStoreContext value={store}>
      <Routes>
        <Route index element={<FeedPage />} />
        <Route path=":postId" element={<PostDetailPage />} />
      </Routes>
    </FeedStoreContext>
  );
}

export default FeedRoutes;
