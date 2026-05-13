// src/main/preload.js
// Minimal, non-duplicated preload exposing backendAPI

const { contextBridge, ipcRenderer } = require("electron");

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

const subscribe = (channel, callback) => {
  const handler = (e, ...args) => callback(...args);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};

contextBridge.exposeInMainWorld("backendAPI", {
  // Auth & session
  youtubeAuthenticate: () => invoke("youtube:authenticate"),
  isYouTubeLoggedIn: () => invoke("youtube:isLoggedIn"),
  signOut: () => invoke("youtube:signOut"),
  getUserInfo: () => invoke("youtube:getUserInfo"),

  // Watch lists
  getWatchLaterVideos: (continuation) => invoke("youtube:getWatchLaterVideos", continuation),
  getWatchHistory: (continuation) => invoke("youtube:getWatchHistory", continuation),

  // Feeds
  getHomeFeed: (continuation) => invoke("youtube:getHomeFeed", continuation),
  getSubscriptionsFeed: (continuation) => invoke("youtube:getSubscriptionsFeed", continuation),
  getTrendingVideos: (continuation) => invoke("youtube:getTrendingVideos", continuation),

  // Search
  searchYouTube: (query, continuation) => invoke("youtube:search", query, continuation),

  // Video / Player
  getYouTubeVideoInfo: (videoId) => invoke("youtube:getVideoInfo", videoId),
  getYouTubeStreamingUrl: (videoId) => invoke("youtube:getStreamingUrl", videoId),

  // Comments & interactions
  getCommentsInitial: (videoId) => invoke("youtube:getCommentsInitial", videoId),
  getMoreComments: (videoId, continuation) => invoke("youtube:getMoreComments", videoId, continuation),
  commentOnVideo: (videoId, text) => invoke("youtube:commentOnVideo", videoId, text),
  replyToComment: (commentId, text) => invoke("youtube:replyToComment", commentId, text),
  likeVideo: (videoId) => invoke("youtube:likeVideo", videoId),
  dislikeVideo: (videoId) => invoke("youtube:dislikeVideo", videoId),
  likeComment: (commentId) => invoke("youtube:likeComment", commentId),

  // Channel
  getYouTubeChannelInfo: (channelId) => invoke("youtube:getChannelInfo", channelId),
  getYouTubeChannelVideos: (channelId) => invoke("youtube:getChannelVideos", channelId),
  getYouTubeChannelPlaylists: (channelId) => invoke("youtube:getChannelPlaylists", channelId),

  // Playlists
  getUserPlaylists: () => invoke("youtube:getUserPlaylists"),
  getPlaylistVideos: (playlistId) => invoke("youtube:getPlaylistVideos", playlistId),

  // Related / recommendations
  getRelatedVideos: (videoId) => invoke("youtube:getRelatedVideos", videoId),

  // App info
  getAppInfo: () => invoke("app:get-info"),

  // File operations
  openFile: (filePath) => invoke("openFile", filePath),
  showItemInFolder: (filePath) => invoke("showItemInFolder", filePath),
  getFileInfo: (filePath) => invoke("getFileInfo", filePath),
  fileExists: (filePath) => invoke("fileExists", filePath),
  openDirectory: (dirPath) => invoke("openDirectory", dirPath),
  getFilesInDirectory: (dirPath, extensions) => invoke("getFilesInDirectory", dirPath, extensions),
  getRecentExports: (exportDir, limit) => invoke("getRecentExports", exportDir, limit),
  deleteFile: (filePath) => invoke("deleteFile", filePath),
  copyFileToClipboard: (filePath) => invoke("copyFileToClipboard", filePath),

  // Window control
  windowControl: (payload) => invoke("window-control", payload),

  // Window events (subscribe helpers)
  onWindowMaximized: (cb) => subscribe("window:maximized", cb),
  onWindowRestored: (cb) => subscribe("window:restored", cb),
  onWindowMinimized: (cb) => subscribe("window:minimized", cb),
  onWindowClosed: (cb) => subscribe("window:closed", cb),
  onWindowResized: (cb) => subscribe("window:resized", cb),
  onWindowMoved: (cb) => subscribe("window:moved", cb),

  // Updater
  updater: (payload) => invoke("updater", payload),

  // Misc
  openExternal: (url) => invoke("openExternal", url),

  // Generic event listener with unsubscribe
  on: (event, callback) => subscribe(event, callback),
});