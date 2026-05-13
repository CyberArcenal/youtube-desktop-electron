// src/renderer/services/youtube/channel.ts
import type { VideoItem, ChannelInfo, PlaylistInfo } from "./types";

/**
 * Fetch channel summary/info from main process.
 */
export async function getChannelInfo(channelId: string): Promise<ChannelInfo | null> {
  try {
    const res = await window.backendAPI.getYouTubeChannelInfo(channelId);
    return (res as ChannelInfo) ?? null;
  } catch (err) {
    // Treat failures as "no info"
    throw err instanceof Error ? err : new Error(String(err));
  }
}

/**
 * Fetch videos for a channel.
 * Returns an empty array on failure to keep callers simple.
 */
export async function getChannelVideos(channelId: string): Promise<VideoItem[]> {
  try {
    const res = await window.backendAPI.getYouTubeChannelVideos(channelId);
    return (res as VideoItem[]) ?? [];
  } catch (err) {
    // Log or rethrow depending on your app conventions; here we return empty array
    // so UI can handle "no videos" gracefully.
    return [];
  }
}

/**
 * Fetch playlists for a channel.
 * Returns an empty array on failure.
 */
export async function getChannelPlaylists(channelId: string): Promise<PlaylistInfo[]> {
  try {
    const res = await window.backendAPI.getYouTubeChannelPlaylists(channelId);
    return (res as PlaylistInfo[]) ?? [];
  } catch (err) {
    return [];
  }
}