// src/main/global.d.ts

export interface AppInfo {
  name: string;
  version: string;
  isDev: boolean;
  platform: string;
  userDataPath: string;
}

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
  format: {
    url: string;
    mimeType: string;
    qualityLabel: string;
  };
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

export interface PlaylistInfo {
  id: string;
  title: string;
  thumbnail?: string;
  videoCount: number;
}

// Additional types for comments pagination
export interface CommentsPage {
  comments: Comment[];
  continuation: string | null;
}

export interface BackendAPI {
  // ===================== YOUTUBE API =====================
  youtubeAuthenticate: () => Promise<void>;
  isYouTubeLoggedIn: () => Promise<boolean>;
  getHomeFeed: (continuation?: string) => Promise<{ videos: VideoItem[]; continuation: string | null }>;
  getTrendingVideos: (continuation?: string) => Promise<{ videos: VideoItem[]; continuation: string | null }>;
  getYouTubeVideoInfo: (videoId: string) => Promise<VideoInfo>;
  getYouTubeStreamingUrl: (videoId: string) => Promise<string>;
  getYouTubeComments: (videoId: string) => Promise<Comment[]>;
  getYouTubeChannelInfo: (channelId: string) => Promise<ChannelInfo>;
  getYouTubeChannelVideos: (channelId: string) => Promise<VideoItem[]>;
  getYouTubeChannelPlaylists: (channelId: string) => Promise<PlaylistInfo[]>;
  getSubscriptionsFeed: (continuation?: string) => Promise<{ videos: VideoItem[]; continuation: string | null }>;
  getUserPlaylists: () => Promise<PlaylistInfo[]>;
  getPlaylistVideos: (playlistId: string) => Promise<VideoItem[]>;
  getRelatedVideos: (videoId: string) => Promise<VideoItem[]>;
  searchYouTube: (query: string, continuation?: string) => Promise<{ videos: VideoItem[]; continuation: string | null }>;

  // Comments pagination (kailangan idagdag sa preload.js)
  getCommentsInitial: (videoId: string) => Promise<CommentsPage>;
  getMoreComments: (videoId: string, continuation: string) => Promise<CommentsPage>;

  // Interactions (subscriber, like, comment)
  subscribe: (channelId: string) => Promise<{ success: boolean }>;
  unsubscribe: (channelId: string) => Promise<{ success: boolean }>;
  likeVideo: (videoId: string) => Promise<{ success: boolean }>;
  dislikeVideo: (videoId: string) => Promise<{ success: boolean }>;
  commentOnVideo: (videoId: string, text: string) => Promise<{ success: boolean; commentId?: string }>;
  replyToComment: (commentId: string, text: string) => Promise<{ success: boolean; replyId?: string }>;
  likeComment: (commentId: string) => Promise<{ success: boolean }>;

  // ===================== APP INFO =====================
  getAppInfo: () => Promise<AppInfo>;

  // ===================== FILE OPERATIONS =====================
  openFile: (filePath: string) => Promise<{ status: boolean; message: string; data?: any }>;
  showItemInFolder: (filePath: string) => Promise<{ status: boolean; message: string; data?: any }>;
  getFileInfo: (filePath: string) => Promise<{ status: boolean; message: string; data?: any }>;
  fileExists: (filePath: string) => Promise<boolean>;
  openDirectory: (dirPath: string) => Promise<{ status: boolean; message: string; data?: any }>;
  getFilesInDirectory: (dirPath: string, extensions?: string[]) => Promise<{ status: boolean; message: string; data?: any[] }>;
  getRecentExports: (exportDir: string, limit?: number) => Promise<{ status: boolean; message: string; data?: any[] }>;
  deleteFile: (filePath: string) => Promise<{ status: boolean; message: string; data?: any }>;
  copyFileToClipboard: (filePath: string) => Promise<{ status: boolean; message: string; data?: any }>;

  // ===================== WINDOW CONTROL =====================
  windowControl: (payload: WindowControlPayload) => Promise<WindowControlResponse>;

  // ===================== WINDOW EVENTS =====================
  onWindowMaximized: (callback: () => void) => void;
  onWindowRestored: (callback: () => void) => void;
  onWindowMinimized: (callback: () => void) => void;
  onWindowClosed: (callback: () => void) => void;
  onWindowResized: (callback: (bounds: WindowBounds) => void) => void;
  onWindowMoved: (callback: (position: { x: number; y: number }) => void) => void;

  // ===================== UPDATER =====================
  updater: (payload: { method: string; params?: any }) => Promise<{
    status: boolean;
    message: string;
    data: any;
  }>;

   openExternal: (url) => Promise<void>;

  // ===================== GENERIC EVENT LISTENER =====================
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => () => void;
}

declare global {
  interface Window {
    backendAPI: BackendAPI;
  }
}

export {};