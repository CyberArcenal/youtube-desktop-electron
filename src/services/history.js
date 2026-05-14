// src/main/services/youtube/history.js
//@ts-check
const core = require("./core");
const { _formatVideo, extractContinuation, extractVideoItems } = require("./utils");
const { logger } = require("../utils/logger");

async function getWatchHistory(continuation = null) {
  try {
    const yt = await core.getInnertube();
    if (!yt || !yt.session) {
      logger.warn("getWatchHistory: Innertube or session unavailable");
      return { videos: [], continuation: null };
    }

    let resp = null;

    // Try different methods
    try {
      if (typeof yt.getHistory === "function") {
        resp = await yt.getHistory(continuation ? { continuation } : undefined);
      }
    } catch (e) {
      logger.debug("getWatchHistory: yt.getHistory failed:", e.message);
    }

    if (!resp) {
      try {
        if (typeof yt.getFeed === "function") {
          resp = await yt.getFeed("history", continuation ? { continuation } : undefined);
        } else if (typeof yt.browse === "function") {
          resp = await yt.browse({ browseId: "history", continuation });
        }
      } catch (e) {
        logger.debug("getWatchHistory: fallback failed:", e.message);
      }
    }

    if (!resp) {
      logger.warn("getWatchHistory: no response from Innertube");
      return { videos: [], continuation: null };
    }

    const rawItems = extractVideoItems(resp);
    const nextCont = extractContinuation(resp);

    const videos = rawItems.map(item => _formatVideo(item)).filter(Boolean);

    return { videos, continuation: nextCont || null };
  } catch (err) {
    logger.error("getWatchHistory failed:", err.message);
    return { videos: [], continuation: null };
  }
}

module.exports = { getWatchHistory };