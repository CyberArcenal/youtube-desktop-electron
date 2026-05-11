// src/renderer/stores/videoStore.ts
import { create } from 'zustand';
import type { VideoItem } from '../services/youtube';

interface VideoState {
  trendingVideos: VideoItem[];
  searchResults: VideoItem[];
  isLoading: boolean;
  error: string | null;
  setTrendingVideos: (videos: VideoItem[]) => void;
  setSearchResults: (videos: VideoItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  trendingVideos: [],
  searchResults: [],
  isLoading: false,
  error: null,
  setTrendingVideos: (videos) => set({ trendingVideos: videos }),
  setSearchResults: (videos) => set({ searchResults: videos }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));