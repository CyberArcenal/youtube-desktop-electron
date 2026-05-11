// src/main/services/youtube/related.js
const core = require("./core");
const { _formatVideo, extractText } = require("./utils");
const { logger } = require("../utils/logger");

async function getRelatedVideos(videoId) {
  try {
    const yt = await core.getInnertube();
    const info = await yt.getInfo(videoId);

    let related = [];

    // 1. Primary sources
    if (info.watch_next_feed?.length) {
      related = info.watch_next_feed.filter(item => 
        item.type === "Video" || item.type === "CompactVideo"
      );
    }

    if (related.length === 0 && info.contents?.twoColumnWatchNextResults?.secondaryResults?.results) {
      const secondary = info.contents.twoColumnWatchNextResults.secondaryResults.results;
      related = secondary
        .map(item => item.compactVideoRenderer || item)
        .filter(Boolean);
    }

    if (related.length === 0 && info.autoplay?.length) {
      related = info.autoplay.filter(item => 
        item.type === "Video" || item.type === "CompactVideo"
      );
    }

    // 2. Strong fallback
    if (related.length === 0) {
      const title = extractText(info.basic_info?.title || info.title);
      if (title && title.length > 3) {
        logger.info(`Search fallback: "${title}"`);
        try {
          const searchResults = await yt.search(title);
          related = (searchResults.results || searchResults.items || [])
            .filter(item => item.type === "Video" && item.id !== videoId)
            .slice(0, 20);
        } catch (e) {
          logger.warn("Search fallback failed");
        }
      }
    }

    const formatted = related
      .map(item => _formatVideo(item))
      .filter(v => v && v.id && v.id !== videoId)
      .slice(0, 20);

    logger.info(`✅ Final related videos returned: ${formatted.length}`);
    return formatted;

  } catch (error) {
    logger.error("Error getting related videos:", error.message);
    return [];
  }
}

module.exports = { getRelatedVideos };