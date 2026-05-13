// src/renderer/hooks/useInfiniteVideos.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import type { VideoItem } from '../services/types';

type FetchFunction = (continuation?: string) => Promise<{ videos: VideoItem[]; continuation: string | null }>;

export function useInfiniteVideos(fetchFn: FetchFunction, deps: any[] = []) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [continuation, setContinuation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const loadInitial = useCallback(async () => {
    if (initialLoadDone.current) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setVideos(result.videos);
      setContinuation(result.continuation);
      setHasMore(!!result.continuation);
      initialLoadDone.current = true;
    } catch (err: any) {
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  const loadMore = useCallback(async () => {
    if (!continuation || !hasMore || loading) return;
    setLoading(true);
    try {
      const result = await fetchFn(continuation);
      setVideos(prev => [...prev, ...result.videos]);
      setContinuation(result.continuation);
      setHasMore(!!result.continuation);
    } catch (err: any) {
      setError(err.message || 'Failed to load more');
    } finally {
      setLoading(false);
    }
  }, [continuation, hasMore, loading, fetchFn]);

  // Reset when dependencies change (e.g., search query)
  useEffect(() => {
    initialLoadDone.current = false;
    setVideos([]);
    setContinuation(null);
    setHasMore(true);
    setError(null);
    loadInitial();
  }, deps);

  return { videos, loading, hasMore, error, loadMore, loadInitial };
}