// src/main/services/youtube/feed.js
const core = require("./core");
const { _formatVideo } = require("./utils");
const { logger } = require("../utils/logger");

async function getHomeFeed(continuation = null) {
  try {
    const yt = await core.getInnertube();
    let feed;

    if (continuation) {
      feed = await yt.getHomeFeed({ continuation });
    } else {
      feed = await yt.getHomeFeed();
    }

    const videos = feed.contents?.filter(item => item.type === "Video") || [];
    const formatted = videos.map(_formatVideo).filter(Boolean);
    const nextContinuation = feed.continuation || null;

    return { 
      videos: formatted, 
      continuation: nextContinuation 
    };
  } catch (err) {
    logger.error("getHomeFeed failed:", err.message);
    return { videos: [], continuation: null };
  }
}

async function getSubscriptionsFeed(continuation = null) {
  try {
    const yt = await core.getInnertube();
    if (!yt.session.logged_in) {
      return { videos: [], continuation: null };
    }

    let feed;
    if (continuation) {
      feed = await yt.getSubscriptionsFeed({ continuation });
    } else {
      feed = await yt.getSubscriptionsFeed();
    }

    const videos = feed.contents?.filter(item => item.type === "Video") || [];
    const formatted = videos.map(_formatVideo).filter(Boolean);
    const nextContinuation = feed.continuation || null;

    return { 
      videos: formatted, 
      continuation: nextContinuation 
    };
  } catch (err) {
    logger.error("getSubscriptionsFeed failed:", err.message);
    return { videos: [], continuation: null };
  }
}

async function getTrendingVideos() {
  const searchModule = require("./search");
  return await searchModule.searchVideos("trending");
}

module.exports = { 
  getHomeFeed, 
  getSubscriptionsFeed, 
  getTrendingVideos 
};