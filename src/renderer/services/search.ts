// src/renderer/services/youtube/search.ts
import type { VideoItem } from "./types";

export async function searchVideos(query: string, continuation?: string): Promise<{ videos: VideoItem[]; continuation: string | null }> {
  return await window.backendAPI.searchYouTube(query, continuation);
}