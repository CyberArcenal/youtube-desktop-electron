// src/renderer/services/youtube/playlist.ts
import type { VideoItem, PlaylistInfo } from "./types";

export async function getUserPlaylists(): Promise<PlaylistInfo[]> {
  return await window.backendAPI.getUserPlaylists();
}

export async function getPlaylistVideos(playlistId: string): Promise<VideoItem[]> {
  return await window.backendAPI.getPlaylistVideos(playlistId);
}