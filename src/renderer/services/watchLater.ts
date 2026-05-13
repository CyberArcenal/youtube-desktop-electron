// src/renderer/services/youtube/watchlater.ts
import type { VideoItem } from "./types";

type WatchLaterResult = { videos: VideoItem[]; continuation: string | null };

/**
 * Fetch watch-later videos (paginated).
 * Normalizes return shape and returns empty result on failure.
 */
export async function getWatchLaterVideos(continuation?: string): Promise<WatchLaterResult> {
  try {
    const res = await window.backendAPI.getWatchLaterVideos(continuation);
    return (res as WatchLaterResult) ?? { videos: [], continuation: null };
  } catch (err) {
    return { videos: [], continuation: null };
  }
}