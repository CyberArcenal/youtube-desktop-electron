// src/renderer/services/youtube/related.ts
import type { VideoItem } from "./types";

export async function getRelatedVideos(videoId: string): Promise<VideoItem[]> {
  return await window.backendAPI.getRelatedVideos(videoId);
}