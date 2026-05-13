// src/main/global.d.ts
export interface AppInfo {
  name: string;
  version: string;
  isDev: boolean;
  platform: string;
  userDataPath: string;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowControlPayload {
  action: string;
  params?: any;
}
export interface WindowControlResponse {
  status: boolean;
  message?: string;
  data?: any;
}

export interface BackendAPI {
  // Auth & session
  youtubeAuthenticate: () => Promise<any>;
  isYouTubeLoggedIn: () => Promise<any>;
  signOut: () => Promise<any>;
  getUserInfo: () => Promise<any>;

  // Watch lists
  getWatchLaterVideos: (continuation?: string) => Promise<any>;
  getWatchHistory: (continuation?: string) => Promise<any>;

  // Feeds
  getHomeFeed: (continuation?: string) => Promise<any>;
  getSubscriptionsFeed: (continuation?: string) => Promise<any>;
  getTrendingVideos: (continuation?: string) => Promise<any>;

  // Search
  searchYouTube: (query: string, continuation?: string) => Promise<any>;

  // Video / Player
  getYouTubeVideoInfo: (videoId: string) => Promise<any>;
  getYouTubeStreamingUrl: (videoId: string) => Promise<any>;

  // Comments & interactions
  getCommentsInitial: (videoId: string) => Promise<any>;
  getMoreComments: (videoId: string, continuation: string) => Promise<any>;
  commentOnVideo: (videoId: string, text: string) => Promise<any>;
  replyToComment: (commentId: string, text: string) => Promise<any>;
  likeVideo: (videoId: string) => Promise<any>;
  dislikeVideo: (videoId: string) => Promise<any>;
  likeComment: (commentId: string) => Promise<any>;
  subscribe: (channelId: string) => Promise<any>;
  unsubscribe: (channelId: string) => Promise<any>;

  // Channel
  getYouTubeChannelInfo: (channelId: string) => Promise<any>;
  getYouTubeChannelVideos: (channelId: string) => Promise<any>;
  getYouTubeChannelPlaylists: (channelId: string) => Promise<any>;

  // Playlists
  getUserPlaylists: () => Promise<any>;
  getPlaylistVideos: (playlistId: string) => Promise<any>;

  // Related / recommendations
  getRelatedVideos: (videoId: string) => Promise<any>;

  // App info
  getAppInfo: () => Promise<any>;

  // File operations
  openFile: (filePath: string) => Promise<any>;
  showItemInFolder: (filePath: string) => Promise<any>;
  getFileInfo: (filePath: string) => Promise<any>;
  fileExists: (filePath: string) => Promise<any>;
  openDirectory: (dirPath: string) => Promise<any>;
  getFilesInDirectory: (dirPath: string, extensions?: string[]) => Promise<any>;
  getRecentExports: (exportDir: string, limit?: number) => Promise<any>;
  deleteFile: (filePath: string) => Promise<any>;
  copyFileToClipboard: (filePath: string) => Promise<any>;

  // Window control
  windowControl: (payload: WindowControlPayload) => Promise<any>;

  // Window events: return unsubscribe function
  onWindowMaximized: (callback: () => void) => () => void;
  onWindowRestored: (callback: () => void) => () => void;
  onWindowMinimized: (callback: () => void) => () => void;
  onWindowClosed: (callback: () => void) => () => void;
  onWindowResized: (callback: (bounds: WindowBounds) => void) => () => void;
  onWindowMoved: (callback: (position: { x: number; y: number }) => void) => () => void;

  // Updater
  updater: (payload: { method: string; params?: any }) => Promise<any>;

  // Misc
  openExternal: (url: string) => Promise<any>;

  // Generic event listener with unsubscribe
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => () => void;
}

declare global {
  interface Window {
    backendAPI: BackendAPI;
  }
}

export {};