// src/renderer/pages/home/hooks/useHomeFeed.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { isLoggedIn, authenticate } from '../../../services/auth';
import { getHomeFeed } from '../../../services/feed';
import { searchVideos } from '../../../services/search';
import type { VideoItem } from '../../../services/types';


interface UseHomeFeedReturn {
  videos: VideoItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loggedIn: boolean;
  hasMore: boolean;
  showLoginPrompt: boolean;
  showAuthModal: boolean;
  onAuthSuccess: () => void;
  setShowLoginPrompt: (show: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  handleSignIn: () => Promise<void>;
  loadMore: () => Promise<void>;
  retry: () => void;
}

export function useHomeFeed(): UseHomeFeedReturn {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [continuation, setContinuation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const initialLoadDone = useRef(false);

  const onAuthSuccess = useCallback(async () => {
  setShowAuthModal(false);
  setLoading(true);
  try {
    const loginStatus = await isLoggedIn();
    setLoggedIn(loginStatus);
    const result = loginStatus ? await getHomeFeed() : await searchVideos('trending');
    setVideos(result.videos);
    setContinuation(result.continuation);
    setHasMore(!!result.continuation);
    setError(null);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loginStatus = await isLoggedIn();
      setLoggedIn(loginStatus);
      
      let result;
      if (loginStatus) {
        result = await getHomeFeed();
      } else {
        result = await searchVideos('trending');
      }
      setVideos(result.videos);
      setContinuation(result.continuation);
      setHasMore(!!result.continuation);
    } catch (err: any) {
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!continuation || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      let result;
      if (loggedIn) {
        result = await getHomeFeed(continuation);
      } else {
        result = await searchVideos('trending', continuation);
      }
      setVideos(prev => [...prev, ...result.videos]);
      setContinuation(result.continuation);
      setHasMore(!!result.continuation);
    } catch (err: any) {
      console.error('Failed to load more', err);
    } finally {
      setLoadingMore(false);
    }
  }, [continuation, loadingMore, hasMore, loggedIn]);

  const handleSignIn = async () => {
    setShowLoginPrompt(false);
    setLoading(true);
    try {
      await authenticate();
      const loginStatus = await isLoggedIn();
      setLoggedIn(loginStatus);
      const result = loginStatus ? await getHomeFeed() : await searchVideos('trending');
      setVideos(result.videos);
      setContinuation(result.continuation);
      setHasMore(!!result.continuation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    loadInitial();
  };

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadInitial();
    }
  }, [loadInitial]);

  return {
    videos,
    loading,
    loadingMore,
    error,
    loggedIn,
    hasMore,
    showLoginPrompt,
    setShowLoginPrompt,
    handleSignIn,
    loadMore,
    retry,

     showAuthModal,
  setShowAuthModal,
  onAuthSuccess,
  };
}