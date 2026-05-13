// src/main/services/youtube/watchlater.js (or keep in same file)
const core = require("./core");
const { _formatVideo } = require("./utils");
const { logger } = require("../utils/logger");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

/**
 * Extract a continuation token from various response shapes.
 * @param {object} resp
 * @returns {string|null}
 */
function extractContinuation(resp) {
  if (!resp) return null;
  if (resp.continuation) return resp.continuation;
  if (resp.nextContinuation) return resp.nextContinuation;
  if (resp.continuations && Array.isArray(resp.continuations) && resp.continuations[0]) {
    return resp.continuations[0].token || resp.continuations[0].continuation || null;
  }
  // common youtubei.js shapes
  if (resp.continuationContents && resp.continuationContents.continuations) {
    const c = resp.continuationContents.continuations[0];
    return c?.nextContinuation || c?.token || null;
  }
  return null;
}

/**
 * Normalize and extract video-like items from a variety of response shapes.
 * Returns array of raw item objects that _formatVideo can handle (best-effort).
 * @param {object} resp
 * @returns {Array}
 */
function extractVideoItems(resp) {
  if (!resp) return [];

  // Common direct arrays
  if (Array.isArray(resp.items) && resp.items.length) return resp.items;
  if (Array.isArray(resp.videos) && resp.videos.length) return resp.videos;
  if (Array.isArray(resp.contents)) return resp.contents;

  // youtubei.js often nests under contents.twoColumn or playlist
  // Try several known shapes defensively
  const candidates = [];

  // playlist
  if (resp.playlist && Array.isArray(resp.playlist.items)) {
    candidates.push(...resp.playlist.items);
  }

  // continuationContents -> playlistVideoListRenderer / contents
  if (resp.continuationContents) {
    const cc = resp.continuationContents;
    if (Array.isArray(cc.contents)) candidates.push(...cc.contents);
    if (cc.playlistVideoListRenderer && Array.isArray(cc.playlistVideoListRenderer.contents)) {
      candidates.push(...cc.playlistVideoListRenderer.contents);
    }
  }

  // contents.twoColumnWatchNextResults or twoColumnBrowseResultsRenderer
  if (resp.contents && typeof resp.contents === "object") {
    // deep scan for arrays named 'contents' or 'items'
    const scan = (obj) => {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj)) {
        obj.forEach((el) => scan(el));
        return;
      }
      for (const k of Object.keys(obj)) {
        if (k === "contents" && Array.isArray(obj[k])) {
          candidates.push(...obj[k]);
        } else if (k === "items" && Array.isArray(obj[k])) {
          candidates.push(...obj[k]);
        } else if (typeof obj[k] === "object") {
          scan(obj[k]);
        }
      }
    };
    scan(resp.contents);
  }

  // fallback: parsedRuns or parsed items
  if (resp.parsed_runs && Array.isArray(resp.parsed_runs)) {
    candidates.push(...resp.parsed_runs);
  }

  // Filter out non-video-like entries (best-effort)
  const filtered = candidates.filter((it) => {
    if (!it) return false;
    // common indicators of video items
    if (it.videoId || it.id || it.type === "video") return true;
    // some renderers wrap video under 'video' or 'content'
    if (it.video && (it.video.videoId || it.video.id)) return true;
    if (it.content && (it.content.videoId || it.content.id)) return true;
    return false;
  });

  return filtered;
}

/**
 * Fetch Watch Later videos (paginated).
 * @param {string|null} continuation
 * @returns {Promise<{videos: Array, continuation: string|null}>}
 */
async function getWatchLaterVideos(continuation = null) {
  try {
    const yt = await core.getInnertube();
    if (!yt || !yt.session) {
      logger.warn("getWatchLaterVideos: Innertube or session unavailable");
      return { videos: [], continuation: null };
    }

    let resp = null;

    // Try a few ways to request the Watch Later list depending on library version
    try {
      // Preferred: getPlaylist with 'WL' id (common)
      if (typeof yt.getPlaylist === "function") {
        // some versions accept (id, { continuation }) or (id, continuation)
        try {
          resp = await yt.getPlaylist("WL", continuation ? { continuation } : undefined);
        } catch (e) {
          // fallback to passing continuation directly if above fails
          try {
            resp = await yt.getPlaylist("WL", continuation);
          } catch (e2) {
            // swallow and try other methods below
            resp = null;
          }
        }
      }
    } catch (e) {
      logger.debug("getWatchLaterVideos: yt.getPlaylist attempt failed:", e.message);
      resp = null;
    }

    // If not obtained, try a feed method or direct endpoint
    if (!resp) {
      try {
        if (typeof yt.getWatchLater === "function") {
          resp = await yt.getWatchLater(continuation);
        } else if (typeof yt.getFeed === "function") {
          // some libs expose feeds by name
          resp = await yt.getFeed("watch_later", continuation ? { continuation } : undefined);
        }
      } catch (e) {
        logger.debug("getWatchLaterVideos: alternate fetch attempt failed:", e.message);
        resp = null;
      }
    }

    // If still no response, try a generic browse with 'WL' as browseId
    if (!resp) {
      try {
        if (typeof yt.browse === "function") {
          // browse may accept { browseId: 'WL', continuation }
          resp = await yt.browse({ browseId: "WL", continuation });
        }
      } catch (e) {
        logger.debug("getWatchLaterVideos: browse attempt failed:", e.message);
        resp = null;
      }
    }

    if (!resp) {
      logger.warn("getWatchLaterVideos: no response from Innertube for Watch Later");
      return { videos: [], continuation: null };
    }

    // Extract video items and continuation token
    const rawItems = extractVideoItems(resp) || [];
    const nextCont = extractContinuation(resp);

    // Format items using _formatVideo (best-effort)
    const videos = [];
    for (const item of rawItems) {
      try {
        // _formatVideo should accept different shapes; pass item directly
        const v = _formatVideo(item);
        if (v) videos.push(v);
      } catch (e) {
        // If formatting fails, attempt to build a minimal object
        try {
          const videoId = item.videoId || item.id || item?.video?.videoId || item?.content?.videoId;
          if (videoId) {
            videos.push({
              id: videoId,
              title: item.title || item?.video?.title || item?.content?.title || null,
              raw: item,
            });
          }
        } catch (inner) {
          // ignore malformed item
        }
      }
    }

    return { videos, continuation: nextCont || null };
  } catch (err) {
    logger.error("getWatchLaterVideos failed:", err && err.message ? err.message : String(err));
    return { videos: [], continuation: null };
  }
}

module.exports = { getWatchLaterVideos };