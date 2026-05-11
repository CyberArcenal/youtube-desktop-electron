// src/main/services/youtube/index.js
const auth = require("./auth");
const player = require("./player");
const feed = require("./feed");
const search = require("./search");
const channel = require("./channel");
const playlist = require("./playlist");
const related = require("./related");
const interactions = require("./interactions");
const comments = require("./comments");
const core = require("./core");

module.exports = {
  // Core
  ...core,

  // Auth
  authenticate: auth.authenticate,
  isLoggedIn: auth.isLoggedIn,

  // Player & Streaming
  getVideoInfo: player.getVideoInfo,
  getVideoStreamingUrl: player.getVideoStreamingUrl,

  // Feed
  getHomeFeed: feed.getHomeFeed,
  getSubscriptionsFeed: feed.getSubscriptionsFeed,
  getTrendingVideos: feed.getTrendingVideos,

  // Comments
   getVideoComments: comments.getVideoComments,
  getVideoCommentsWithToken: comments.getVideoCommentsWithToken,
  getMoreComments: comments.getMoreComments,

  // Search
  searchVideos: search.searchVideos,

  // Channel
  getChannelInfo: channel.getChannelInfo,
  getChannelVideos: channel.getChannelVideos,
  getChannelPlaylists: channel.getChannelPlaylists,

  // Playlist
  getUserPlaylists: playlist.getUserPlaylists,
  getPlaylistVideos: playlist.getPlaylistVideos,

  // Related
  getRelatedVideos: related.getRelatedVideos,

  // Interactions
  subscribe: interactions.subscribe,
  unsubscribe: interactions.unsubscribe,
  likeVideo: interactions.likeVideo,
  dislikeVideo: interactions.dislikeVideo,
  commentOnVideo: interactions.commentOnVideo,
  replyToComment: interactions.replyToComment,
  likeComment: interactions.likeComment,
};