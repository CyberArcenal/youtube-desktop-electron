// src/renderer/pages/search/SearchPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoGrid from '../../components/Shared/VideoGrid';
import type { VideoItem } from '../../services/types';
import { searchVideos } from '../../services/search';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [continuation, setContinuation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Reset and load when query changes
  useEffect(() => {
    if (!query) return;

    const loadInitial = async () => {
      setInitialLoading(true);
      setError(null);
      setVideos([]);
      setContinuation(null);
      setHasMore(true);

      try {
        const result = await searchVideos(query);
        setVideos(result.videos);
        setContinuation(result.continuation);
        setHasMore(!!result.continuation);
      } catch (err: any) {
        setError(err.message || 'Failed to search videos');
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitial();
  }, [query]);

  const loadMore = async () => {
    if (!continuation || !hasMore || loading) return;
    setLoading(true);
    try {
      const result = await searchVideos(query, continuation);
      setVideos(prev => [...prev, ...result.videos]);
      setContinuation(result.continuation);
      setHasMore(!!result.continuation);
    } catch (err: any) {
      console.error('Load more error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Empty state when no query
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-[#1f1f1f] rounded-full p-4 mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Search YouTube</h2>
        <p className="text-gray-400">Type something in the search bar above</p>
      </div>
    );
  }

  // Initial loading
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Error state
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

  // Empty results
  if (videos.length === 0 && !initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-[#1f1f1f] rounded-full p-4 mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No results found</h2>
        <p className="text-gray-400">Try different keywords or check your spelling</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">
          Search results for "<span className="text-red-500">{query}</span>"
        </h2>
        <p className="text-gray-400 text-sm mt-1">{videos.length} videos</p>
      </div>

      <VideoGrid videos={videos} />

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-white text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-t-2 border-white rounded-full"></div>
                Loading...
              </div>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;