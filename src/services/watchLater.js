// src/main/services/youtube/watchLater.js
const core = require("./core");
const { _formatVideo, extractContinuation, extractVideoItems } = require("./utils");
const { logger } = require("../utils/logger");

async function getWatchLaterVideos(continuation = null) {
  try {
    const yt = await core.getInnertube();
    if (!yt || !yt.session) {
      logger.warn("getWatchLaterVideos: Innertube or session unavailable");
      return { videos: [], continuation: null };
    }

    let resp = null;

    try {
      if (typeof yt.getPlaylist === "function") {
        resp = await yt.getPlaylist("WL", continuation ? { continuation } : undefined);
      }
    } catch (e) {
      logger.debug("getWatchLaterVideos: yt.getPlaylist failed:", e.message);
    }

    if (!resp) {
      try {
        if (typeof yt.getWatchLater === "function") {
          resp = await yt.getWatchLater(continuation);
        } else if (typeof yt.getFeed === "function") {
          resp = await yt.getFeed("watch_later", continuation ? { continuation } : undefined);
        }
      } catch (e) {
        logger.debug("getWatchLaterVideos: fallback failed:", e.message);
      }
    }

    if (!resp) {
      try {
        if (typeof yt.browse === "function") {
          resp = await yt.browse({ browseId: "WL", continuation });
        }
      } catch (e) {
        logger.debug("getWatchLaterVideos: browse failed:", e.message);
      }
    }

    if (!resp) {
      logger.warn("getWatchLaterVideos: no response from Innertube");
      return { videos: [], continuation: null };
    }

    const rawItems = extractVideoItems(resp);
    const nextCont = extractContinuation(resp);
    const videos = rawItems.map(item => _formatVideo(item)).filter(Boolean);

    return { videos, continuation: nextCont || null };
  } catch (err) {
    logger.error("getWatchLaterVideos failed:", err.message);
    return { videos: [], continuation: null };
  }
}

module.exports = { getWatchLaterVideos };