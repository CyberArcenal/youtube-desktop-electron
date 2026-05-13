// src/renderer/pages/subscriptions/SubscriptionsPage.tsx
import React from 'react';
import VideoGrid from '../../components/Shared/VideoGrid';
import { useInfiniteVideos } from '../../hooks/useInfiniteVideos';
import { getSubscriptionsFeed } from '../../services/feed';

const SubscriptionsPage: React.FC = () => {
  const { videos, loading, hasMore, error, loadMore } = useInfiniteVideos(getSubscriptionsFeed);

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-screen-2xl mx-auto">
      <VideoGrid videos={videos} title="Subscriptions" />
      {loading && <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 border-t-2 border-red-600 rounded-full" /></div>}
      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button onClick={loadMore} className="px-5 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-white text-sm transition">Load more</button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;