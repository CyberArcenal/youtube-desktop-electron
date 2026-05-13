// src/renderer/services/youtube/player.ts
import type { VideoInfo } from "./types";

/**
 * Fetch video metadata from main process.
 */
export async function getVideoInfo(videoId: string): Promise<VideoInfo | null> {
  try {
    const res = await window.backendAPI.getYouTubeVideoInfo(videoId);
    return (res as VideoInfo) ?? null;
  } catch (err) {
    // Normalize error for callers
    throw err instanceof Error ? err : new Error(String(err));
  }
}

/**
 * Fetch a streaming URL for the given video.
 */
export async function getVideoStreamingUrl(videoId: string): Promise<string | null> {
  try {
    const url = await window.backendAPI.getYouTubeStreamingUrl(videoId);
    return (typeof url === "string" && url.length > 0) ? url : null;
  } catch (err) {
    throw err instanceof Error ? err : new Error(String(err));
  }
}