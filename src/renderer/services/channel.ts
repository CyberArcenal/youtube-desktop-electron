// src/renderer/services/youtube/channel.ts
import type { VideoItem, ChannelInfo, PlaylistInfo } from "./types";

export async function getChannelInfo(channelId: string): Promise<ChannelInfo> {
  return await window.backendAPI.getYouTubeChannelInfo(channelId);
}

export async function getChannelVideos(channelId: string): Promise<VideoItem[]> {
  return await window.backendAPI.getYouTubeChannelVideos(channelId);
}

export async function getChannelPlaylists(channelId: string): Promise<PlaylistInfo[]> {
  return await window.backendAPI.getYouTubeChannelPlaylists(channelId);
}