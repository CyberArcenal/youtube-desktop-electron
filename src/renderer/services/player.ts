// src/renderer/services/youtube/player.ts
import type { VideoInfo } from "./types";

export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  return await window.backendAPI.getYouTubeVideoInfo(videoId);
}

export async function getVideoStreamingUrl(videoId: string): Promise<string> {
  return await window.backendAPI.getYouTubeStreamingUrl(videoId);
}