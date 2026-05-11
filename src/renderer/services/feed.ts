// src/renderer/services/youtube/feed.ts
import type { VideoItem } from "./types";

export async function getHomeFeed(continuation?: string): Promise<{ videos: VideoItem[]; continuation: string | null }> {
  return await window.backendAPI.getHomeFeed(continuation);
}

export async function getSubscriptionsFeed(continuation?: string): Promise<{ videos: VideoItem[]; continuation: string | null }> {
  return await window.backendAPI.getSubscriptionsFeed(continuation);
}

export async function getTrendingVideos(continuation?: string): Promise<{ videos: VideoItem[]; continuation: string | null }> {
  return await window.backendAPI.getTrendingVideos(continuation);
}