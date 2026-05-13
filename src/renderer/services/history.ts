// src/renderer/services/youtube/history.ts
import type { VideoItem } from "./types";

type HistoryResult = { videos: VideoItem[]; continuation: string | null };

/**
 * Fetch watch history (paginated).
 * Returns a normalized shape even on IPC failure.
 */
export async function getWatchHistory(continuation?: string): Promise<HistoryResult> {
  try {
    const res = await window.backendAPI.getWatchHistory(continuation);
    return (res as HistoryResult) ?? { videos: [], continuation: null };
  } catch (err) {
    return { videos: [], continuation: null };
  }
}