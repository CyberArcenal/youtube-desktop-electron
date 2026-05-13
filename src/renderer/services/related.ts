// src/renderer/services/youtube/related.ts
import type { VideoItem } from "./types";

type RelatedResult = VideoItem[];

/**
 * Fetch related videos for a given videoId.
 * Returns an empty array on failure to keep UI stable.
 */
export async function getRelatedVideos(videoId: string): Promise<RelatedResult> {
  try {
    const res = await window.backendAPI.getRelatedVideos(videoId);
    return (res as RelatedResult) ?? [];
  } catch (err) {
    return [];
  }
}