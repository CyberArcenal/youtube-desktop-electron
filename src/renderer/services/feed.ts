// src/renderer/services/youtube/feed.ts
import type { VideoItem } from "./types";

type FeedResult = { videos: VideoItem[]; continuation: string | null };

/**
 * Fetch home feed (paginated).
 */
export async function getHomeFeed(continuation?: string): Promise<FeedResult> {
  try {
    const res = await window.backendAPI.getHomeFeed(continuation);
    return (res as FeedResult) ?? { videos: [], continuation: null };
  } catch (err) {
    return { videos: [], continuation: null };
  }
}

/**
 * Fetch subscriptions feed (paginated).
 */
export async function getSubscriptionsFeed(continuation?: string): Promise<FeedResult> {
  try {
    const res = await window.backendAPI.getSubscriptionsFeed(continuation);
    return (res as FeedResult) ?? { videos: [], continuation: null };
  } catch (err) {
    return { videos: [], continuation: null };
  }
}

/**
 * Fetch trending videos (paginated).
 */
export async function getTrendingVideos(continuation?: string): Promise<FeedResult> {
  try {
    const res = await window.backendAPI.getTrendingVideos(continuation);
    return (res as FeedResult) ?? { videos: [], continuation: null };
  } catch (err) {
    return { videos: [], continuation: null };
  }
}