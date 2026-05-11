// src/main/preload.js
// YouTube Desktop App - Modular & Clean Preload

const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ YouTube Desktop preload loaded (Modular pattern)");

// ===================== YOUTUBE API =====================
const youtubeAPI = {
  // Auth
  authenticate: () => ipcRenderer.invoke("youtube:authenticate"),
  isLoggedIn: () => ipcRenderer.invoke("youtube:isLoggedIn"),

  // Feed
  getHomeFeed: () => ipcRenderer.invoke("youtube:getHomeFeed"),
  getSubscriptionsFeed: () =>
    ipcRenderer.invoke("youtube:getSubscriptionsFeed"),
  getTrendingVideos: () => ipcRenderer.invoke("youtube:getTrendingVideos"),

  // Search
  search: (query) => ipcRenderer.invoke("youtube:search", query),

  // Player & Streaming
  getVideoInfo: (videoId) =>
    ipcRenderer.invoke("youtube:getVideoInfo", videoId),
  getStreamingUrl: (videoId) =>
    ipcRenderer.invoke("youtube:getStreamingUrl", videoId),

  // Comments & Interactions
  getCommentsInitial: (videoId) =>
    ipcRenderer.invoke("youtube:getCommentsInitial", videoId),
  getMoreComments: (videoId, continuation) =>
    ipcRenderer.invoke("youtube:getMoreComments", videoId, continuation),

  getMoreComments: (videoId, continuation) =>
    ipcRenderer.invoke("youtube:getMoreComments", videoId, continuation),
  commentOnVideo: (videoId, text) =>
    ipcRenderer.invoke("youtube:commentOnVideo", videoId, text),
  replyToComment: (commentId, text) =>
    ipcRenderer.invoke("youtube:replyToComment", commentId, text),
  likeVideo: (videoId) => ipcRenderer.invoke("youtube:likeVideo", videoId),
  dislikeVideo: (videoId) =>
    ipcRenderer.invoke("youtube:dislikeVideo", videoId),
  likeComment: (commentId) =>
    ipcRenderer.invoke("youtube:likeComment", commentId),

  // Channel
  getChannelInfo: (channelId) =>
    ipcRenderer.invoke("youtube:getChannelInfo", channelId),
  getChannelVideos: (channelId) =>
    ipcRenderer.invoke("youtube:getChannelVideos", channelId),
  getChannelPlaylists: (channelId) =>
    ipcRenderer.invoke("youtube:getChannelPlaylists", channelId),

  // Playlist
  getUserPlaylists: () => ipcRenderer.invoke("youtube:getUserPlaylists"),
  getPlaylistVideos: (playlistId) =>
    ipcRenderer.invoke("youtube:getPlaylistVideos", playlistId),

  // Related
  getRelatedVideos: (videoId) =>
    ipcRenderer.invoke("youtube:getRelatedVideos", videoId),

  // Subscribe
  subscribe: (channelId) => ipcRenderer.invoke("youtube:subscribe", channelId),
  unsubscribe: (channelId) =>
    ipcRenderer.invoke("youtube:unsubscribe", channelId),
};

// ===================== MAIN EXPOSURE =====================
contextBridge.exposeInMainWorld("backendAPI", {
  // YouTube API (grouped)
  youtube: youtubeAPI,

  // Legacy compatibility (optional - for backward compatibility)
  youtubeAuthenticate: youtubeAPI.authenticate,
  isYouTubeLoggedIn: youtubeAPI.isLoggedIn,
  getHomeFeed: youtubeAPI.getHomeFeed,
  searchYouTube: youtubeAPI.search,
  getYouTubeVideoInfo: youtubeAPI.getVideoInfo,
  getYouTubeStreamingUrl: youtubeAPI.getStreamingUrl,
   getCommentsInitial: youtubeAPI.getCommentsInitial,
  getMoreComments: youtubeAPI.getMoreComments,
  getYouTubeChannelInfo: youtubeAPI.getChannelInfo,
  getYouTubeChannelVideos: youtubeAPI.getChannelVideos,
  getYouTubeChannelPlaylists: youtubeAPI.getChannelPlaylists,
  getSubscriptionsFeed: youtubeAPI.getSubscriptionsFeed,
  getUserPlaylists: youtubeAPI.getUserPlaylists,
  getPlaylistVideos: youtubeAPI.getPlaylistVideos,
  getRelatedVideos: youtubeAPI.getRelatedVideos,

  // ===================== APP INFO =====================
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),

  // ===================== FILE OPERATIONS =====================
  openFile: (filePath) => ipcRenderer.invoke("openFile", filePath),
  showItemInFolder: (filePath) =>
    ipcRenderer.invoke("showItemInFolder", filePath),
  getFileInfo: (filePath) => ipcRenderer.invoke("getFileInfo", filePath),
  fileExists: (filePath) => ipcRenderer.invoke("fileExists", filePath),
  openDirectory: (dirPath) => ipcRenderer.invoke("openDirectory", dirPath),
  getFilesInDirectory: (dirPath, extensions) =>
    ipcRenderer.invoke("getFilesInDirectory", dirPath, extensions),
  getRecentExports: (exportDir, limit) =>
    ipcRenderer.invoke("getRecentExports", exportDir, limit),
  deleteFile: (filePath) => ipcRenderer.invoke("deleteFile", filePath),
  copyFileToClipboard: (filePath) =>
    ipcRenderer.invoke("copyFileToClipboard", filePath),

  // ===================== WINDOW CONTROL =====================
  windowControl: (payload) => ipcRenderer.invoke("window-control", payload),

  // ===================== WINDOW EVENTS =====================
  onWindowMaximized: (callback) =>
    ipcRenderer.on("window:maximized", () => callback()),
  onWindowRestored: (callback) =>
    ipcRenderer.on("window:restored", () => callback()),
  onWindowMinimized: (callback) =>
    ipcRenderer.on("window:minimized", () => callback()),
  onWindowClosed: (callback) =>
    ipcRenderer.on("window:closed", () => callback()),
  onWindowResized: (callback) =>
    ipcRenderer.on("window:resized", (_, bounds) => callback(bounds)),
  onWindowMoved: (callback) =>
    ipcRenderer.on("window:moved", (_, position) => callback(position)),

  // ===================== UPDATER =====================
  updater: (payload) => ipcRenderer.invoke("updater", payload),

  openExternal: (url) => shell.openExternal(url),

  // ===================== GENERIC EVENT LISTENER =====================
  on: (event, callback) => {
    ipcRenderer.on(event, callback);
    return () => ipcRenderer.removeListener(event, callback);
  },
});
