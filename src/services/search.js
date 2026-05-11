// src/main/services/youtube/search.js
const core = require("./core");
const { _formatVideo } = require("./utils");
const { logger } = require("../utils/logger");
async function searchVideos(query, continuation = null) {
  try {
    const yt = await core.getInnertube();
    let result;

    if (continuation) {
      result = await yt.search(query, { continuation });
    } else {
      result = await yt.search(query);
    }

    const videos = (result.results || result.items || [])
      .filter(item => item.type === "Video");

    return {
      videos: videos.map(_formatVideo).filter(Boolean),
      continuation: result.continuation || null
    };
  } catch (err) {
    logger.error("Search failed:", err.message);
    return { videos: [], continuation: null };
  }
}

module.exports = { searchVideos };