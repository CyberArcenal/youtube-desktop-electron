// src/main/services/youtube/feed.js
const core = require("./core");
const { _formatVideo } = require("./utils");
const { logger } = require("../utils/logger");

async function getHomeFeed(continuation = null) {
  try {
    const yt = await core.getInnertube();
    let feed = await yt.getHomeFeed();

    // Optional debug dump – only in development
    if (process.env.NODE_ENV === "development" && process.env.DEBUG_FEED === "1") {
      const fs = require("fs");
      const path = require("path");
      const { app } = require("electron");
      const dumpPath = path.join(app.getPath("userData"), "feed-debug.json");
      fs.writeFileSync(dumpPath, JSON.stringify(feed, null, 2), "utf8");
      logger.info(`[HomeFeed DEBUG] Full feed saved to: ${dumpPath}`);
    }

    let videos = (feed.videos || []).map(_formatVideo).filter(Boolean);

    // Fallback: use search for "trending" only if needed
    if (videos.length === 0) {
      logger.info("[HomeFeed] No videos from home feed, falling back to trending search");
      try {
        const searchModule = require("./search");
        const trendingResult = await searchModule.searchVideos("trending");
        videos = (trendingResult.videos || []).map(_formatVideo).filter(Boolean);
        logger.info(`[HomeFeed] Got ${videos.length} videos from Trending search`);
      } catch (trendingError) {
        logger.warn("Trending fallback failed:", trendingError.message);
      }
    }

    return {
      videos,
      continuation: feed.continuation || null,
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

    const videos = (feed.videos || []).map(_formatVideo).filter(Boolean);
    return { videos, continuation: feed.continuation || null };
  } catch (err) {
    logger.error("getSubscriptionsFeed failed:", err.message);
    return { videos: [], continuation: null };
  }
}

async function getTrendingVideos() {
  // Ideally use yt.getTrending() if available, else fallback to search
  try {
    const yt = await core.getInnertube();
    if (typeof yt.getTrending === "function") {
      const trending = await yt.getTrending();
      return (trending.videos || []).map(_formatVideo).filter(Boolean);
    }
  } catch (err) {
    logger.debug("getTrending() failed, using search fallback:", err.message);
  }
  // Fallback to search
  const searchModule = require("./search");
  const result = await searchModule.searchVideos("trending");
  return (result.videos || []).map(_formatVideo).filter(Boolean);
}

module.exports = { getHomeFeed, getSubscriptionsFeed, getTrendingVideos };