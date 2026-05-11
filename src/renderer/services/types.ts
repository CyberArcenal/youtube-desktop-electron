// src/renderer/services/youtube/types.ts
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

export interface CommentsPage {
  comments: Comment[];
  continuation: string | null;
}

export interface ChannelInfo {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  subscriberCount: string;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  thumbnail?: string;
  videoCount: number;
}