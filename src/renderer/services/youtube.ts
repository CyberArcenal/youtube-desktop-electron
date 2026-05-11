// src/renderer/youtube.ts
export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  viewCount: string;
  publishedDate: string;
  duration: string;
}

export interface VideoInfo {
  format: { url: string; mimeType: string; qualityLabel: string };
  title: string;
  channel: string;
  viewCount?: string;
}

export interface Comment {
  id: string;
  author: string;
  authorId?: string;
  text: string;
  likes: number;
  publishedDate: string;
}

export interface ChannelInfo {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  subscriberCount: string;
}

export interface CommentsPage {
  comments: Comment[];
  continuation: string | null;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  thumbnail?: string;
  videoCount: number;        // Changed to number for consistency
}

// API Wrappers
export async function authenticate() {
  return await window.backendAPI.youtubeAuthenticate();
}

export async function isLoggedIn() {
  return await window.backendAPI.isYouTubeLoggedIn();
}

export async function getHomeFeed() {
  return await window.backendAPI.getHomeFeed();
}

export async function searchVideos(query: string) {
  return await window.backendAPI.searchYouTube(query);
}

export async function getVideoInfo(videoId: string) {
  return await window.backendAPI.getYouTubeVideoInfo(videoId);
}

export async function getVideoStreamingUrl(videoId: string) {
  return await window.backendAPI.getYouTubeStreamingUrl(videoId);
}

export async function getVideoComments(videoId: string) {
  return await window.backendAPI.getYouTubeComments(videoId);
}

export async function getChannelInfo(channelId: string) {
  return await window.backendAPI.getYouTubeChannelInfo(channelId);
}

export async function getChannelVideos(channelId: string) {
  return await window.backendAPI.getYouTubeChannelVideos(channelId);
}

export async function getChannelPlaylists(channelId: string) {
  return await window.backendAPI.getYouTubeChannelPlaylists(channelId);
}

export async function getSubscriptionsFeed() {
  return await window.backendAPI.getSubscriptionsFeed();
}

export async function getUserPlaylists() {
  return await window.backendAPI.getUserPlaylists();
}

export async function getPlaylistVideos(playlistId: string) {
  return await window.backendAPI.getPlaylistVideos(playlistId);
}

export async function getRelatedVideos(videoId: string): Promise<VideoItem[]> {
  return await window.backendAPI.getRelatedVideos(videoId);
}