// src/main/services/youtube/watchhistory.js
//@ts-check
const core = require("./core");
const { _formatVideo } = require("./utils");
const { logger } = require("../utils/logger");

/**
 * Extract a continuation token from various response shapes.
 * @param {object} resp
 * @returns {string|null}
 */
function extractContinuation(resp) {
  if (!resp) return null;
  if (resp.continuation) return resp.continuation;
  if (resp.nextContinuation) return resp.nextContinuation;
  if (
    resp.continuations &&
    Array.isArray(resp.continuations) &&
    resp.continuations[0]
  ) {
    return (
      resp.continuations[0].token || resp.continuations[0].continuation || null
    );
  }
  if (resp.continuationContents && resp.continuationContents.continuations) {
    const c = resp.continuationContents.continuations[0];
    return c?.nextContinuation || c?.token || null;
  }
  // browse responses sometimes nest under onResponseReceivedActions
  if (
    resp.onResponseReceivedActions &&
    Array.isArray(resp.onResponseReceivedActions)
  ) {
    for (const a of resp.onResponseReceivedActions) {
      if (
        a.appendContinuationItemsAction &&
        a.appendContinuationItemsAction.continuationItems
      ) {
        const ci = a.appendContinuationItemsAction.continuationItems[0];
        if (
          ci &&
          ci.continuationItemRenderer &&
          ci.continuationItemRenderer.continuationEndpoint
        ) {
          return ci.continuationItemRenderer.continuationEndpoint.token || null;
        }
      }
    }
  }
  return null;
}

/**
 * Extract video-like items from a variety of response shapes.
 * @param {object} resp
 * @returns {Array}
 */
function extractVideoItems(resp) {
  if (!resp) return [];

  // Common direct arrays
  if (Array.isArray(resp.items) && resp.items.length) return resp.items;
  if (Array.isArray(resp.videos) && resp.videos.length) return resp.videos;
  if (Array.isArray(resp.contents) && resp.contents.length)
    return resp.contents;

  const candidates = [];

  // continuationContents -> contents
  if (resp.continuationContents) {
    const cc = resp.continuationContents;
    if (Array.isArray(cc.contents)) candidates.push(...cc.contents);
    if (
      cc.sectionListRenderer &&
      Array.isArray(cc.sectionListRenderer.contents)
    ) {
      candidates.push(...cc.sectionListRenderer.contents);
    }
  }

  // onResponseReceivedActions / appendContinuationItemsAction
  if (Array.isArray(resp.onResponseReceivedActions)) {
    for (const action of resp.onResponseReceivedActions) {
      if (
        action.appendContinuationItemsAction &&
        Array.isArray(action.appendContinuationItemsAction.continuationItems)
      ) {
        candidates.push(
          ...action.appendContinuationItemsAction.continuationItems,
        );
      }
      if (
        action.reloadContinuationItemsCommand &&
        Array.isArray(action.reloadContinuationItemsCommand.continuationItems)
      ) {
        candidates.push(
          ...action.reloadContinuationItemsCommand.continuationItems,
        );
      }
    }
  }

  // browse results and nested contents
  if (resp.contents && typeof resp.contents === "object") {
    const scan = (obj) => {
      if (!obj) return;
      if (Array.isArray(obj)) {
        obj.forEach(scan);
        return;
      }
      if (typeof obj !== "object") return;
      for (const k of Object.keys(obj)) {
        if ((k === "contents" || k === "items") && Array.isArray(obj[k])) {
          candidates.push(...obj[k]);
        } else if (typeof obj[k] === "object") {
          scan(obj[k]);
        }
      }
    };
    scan(resp.contents);
  }

  // playlist-like shapes
  if (resp.playlist && Array.isArray(resp.playlist.items)) {
    candidates.push(...resp.playlist.items);
  }

  // parsed_runs fallback
  if (Array.isArray(resp.parsed_runs)) candidates.push(...resp.parsed_runs);

  // Filter to likely video items
  const filtered = candidates.filter((it) => {
    if (!it) return false;
    if (it.videoId || it.id || it.type === "video") return true;
    if (it.video && (it.video.videoId || it.video.id)) return true;
    if (it.content && (it.content.videoId || it.content.id)) return true;
    // renderers: videoRenderer, playlistVideoRenderer, gridVideoRenderer
    if (it.videoRenderer || it.playlistVideoRenderer || it.gridVideoRenderer)
      return true;
    return false;
  });

  return filtered;
}

/**
 * Fetch Watch History videos (paginated).
 * @param {string|null} continuation
 * @returns {Promise<{videos: Array, continuation: string|null}>}
 */
async function getWatchHistory(continuation = null) {
  try {
    const yt = await core.getInnertube();
    if (!yt || !yt.session) {
      logger.warn("getWatchHistory: Innertube or session unavailable");
      return { videos: [], continuation: null };
    }

    let resp = null;

    // Try library-specific methods in order of likelihood
    try {
      if (typeof yt.getHistory === "function") {
        // some versions accept continuation as second arg or in options
        try {
          resp = await yt.getHistory(
            continuation ? { continuation } : undefined,
          );
        } catch (e) {
          try {
            resp = await yt.getHistory(continuation);
          } catch (e2) {
            resp = null;
          }
        }
      }
    } catch (e) {
      logger.debug("getWatchHistory: yt.getHistory attempt failed:", e.message);
      resp = null;
    }

    // Fallbacks: feed or browse
    if (!resp) {
      try {
        if (typeof yt.getFeed === "function") {
          resp = await yt.getFeed(
            "history",
            continuation ? { continuation } : undefined,
          );
        } else if (typeof yt.browse === "function") {
          resp = await yt.browse({ browseId: "history", continuation });
        }
      } catch (e) {
        logger.debug(
          "getWatchHistory: alternate fetch attempt failed:",
          e.message,
        );
        resp = null;
      }
    }

    if (!resp) {
      logger.warn(
        "getWatchHistory: no response from Innertube for Watch History",
      );
      return { videos: [], continuation: null };
    }

    // Extract items and continuation
    const rawItems = extractVideoItems(resp) || [];
    const nextCont = extractContinuation(resp);

    const videos = [];
    for (const item of rawItems) {
      try {
        const v = _formatVideo(item);
        if (v) {
          videos.push(v);
          continue;
        }
      } catch (e) {
        // ignore and try fallback
      }

      // Fallback minimal mapping
      try {
        const videoId =
          item.videoId ||
          item.id ||
          item?.video?.videoId ||
          item?.content?.videoId ||
          item?.videoRenderer?.videoId ||
          item?.playlistVideoRenderer?.videoId;
        if (videoId) {
          const title =
            item.title ||
            item?.video?.title ||
            item?.content?.title ||
            item?.videoRenderer?.title?.runs?.[0]?.text ||
            null;
          videos.push({
            id: videoId,
            title,
            raw: item,
          });
        }
      } catch (inner) {
        // skip malformed item
      }
    }

    return { videos, continuation: nextCont || null };
  } catch (err) {
    logger.error(
      "getWatchHistory failed:",
      err && err.message ? err.message : String(err),
    );
    return { videos: [], continuation: null };
  }
}

module.exports = { getWatchHistory };
