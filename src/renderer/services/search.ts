// src/renderer/services/youtube/search.ts
import type { VideoItem } from "./types";

type SearchResult = { videos: VideoItem[]; continuation: string | null };

/**
 * Search YouTube (paginated).
 * Returns a normalized shape even on IPC failure.
 */
export async function searchVideos(query: string, continuation?: string): Promise<SearchResult> {
  try {
    const res = await window.backendAPI.searchYouTube(query, continuation);
    return (res as SearchResult) ?? { videos: [], continuation: null };
  } catch (err) {
    return { videos: [], continuation: null };
  }
}