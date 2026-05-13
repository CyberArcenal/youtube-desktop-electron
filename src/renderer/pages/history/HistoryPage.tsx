// src/renderer/pages/history/HistoryPage.tsx
import React from 'react';
import { History } from 'lucide-react';
import VideoGrid from '../../components/Shared/VideoGrid';
import { useInfiniteVideos } from '../../hooks/useInfiniteVideos';

import AuthGuard from '../../components/Auth/AuthGuard';
import { getWatchHistory } from '../../services/history';

const HistoryPage: React.FC = () => {
  const { videos, loading, hasMore, error, loadMore } = useInfiniteVideos(getWatchHistory);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-sm text-white transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <History size={28} className="text-white" />
          <h1 className="text-2xl font-bold text-white">Watch history</h1>
        </div>

        {videos.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-[#1f1f1f] rounded-full p-4 mb-4">
              <History size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">History is empty</h2>
            <p className="text-gray-400">Videos you watch will appear here</p>
          </div>
        )}

        <VideoGrid videos={videos} />

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-red-600 rounded-full" />
          </div>
        )}

        {hasMore && !loading && videos.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMore}
              className="px-5 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-white text-sm transition"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default HistoryPage;