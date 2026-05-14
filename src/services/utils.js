// src/main/services/youtube/utils.js

function extractText(field) {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (field.text) return field.text;
  if (field.simpleText) return field.simpleText;
  if (field.runs?.length) return field.runs.map(r => r.text || "").join("");
  return "";
}

function _formatVideo(video) {
  if (!video) return null;
  let duration = "";
  if (video.duration) {
    duration = typeof video.duration === "string" ? video.duration : video.duration.text || "";
  } else if (video.length_text) {
    duration = extractText(video.length_text);
  } else if (video.length_seconds) {
    const mins = Math.floor(video.length_seconds / 60);
    const secs = video.length_seconds % 60;
    duration = `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  let thumbnail = "";
  if (video.thumbnails?.[0]?.url) {
    thumbnail = video.thumbnails[0].url;
  } else if (video.thumbnail?.url) {
    thumbnail = video.thumbnail.url;
  } else if (typeof video.thumbnail === "string") {
    thumbnail = video.thumbnail;
  } else if (video.thumbnails?.length > 0 && video.thumbnails[0]?.url) {
    thumbnail = video.thumbnails[0].url;
  } else if (video.Thumbnail?.url) {
    thumbnail = video.Thumbnail.url;
  } else if (video.thumbnail_url) {
    thumbnail = video.thumbnail_url;
  } else if (video.thumbnails?.[0]?.thumbnails?.[0]?.url) {
    thumbnail = video.thumbnails[0].thumbnails[0].url;
  }

  return {
    id: video.id || video.videoId || "",
    title: extractText(video.title),
    thumbnail,
    channelName: extractText(video.author?.name || video.channel?.name),
    channelId: video.author?.id || video.channel?.id || "",
    viewCount: extractText(video.view_count || video.viewCount) || "0",
    publishedDate: extractText(video.published?.text || video.uploadedDate),
    duration,
  };
}

/**
 * Extract a continuation token from various YouTube API response shapes.
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
  if (resp.continuationContents && resp.continuationContents.continuations) {
    const c = resp.continuationContents.continuations[0];
    return c?.nextContinuation || c?.token || null;
  }
  if (resp.onResponseReceivedActions && Array.isArray(resp.onResponseReceivedActions)) {
    for (const a of resp.onResponseReceivedActions) {
      if (a.appendContinuationItemsAction?.continuationItems?.[0]?.continuationItemRenderer?.continuationEndpoint) {
        return a.appendContinuationItemsAction.continuationItems[0].continuationItemRenderer.continuationEndpoint.token || null;
      }
    }
  }
  return null;
}

/**
 * Extract video-like items from various response shapes.
 * @param {object} resp
 * @returns {Array}
 */
function extractVideoItems(resp) {
  if (!resp) return [];

  if (Array.isArray(resp.items) && resp.items.length) return resp.items;
  if (Array.isArray(resp.videos) && resp.videos.length) return resp.videos;
  if (Array.isArray(resp.contents)) return resp.contents;

  const candidates = [];

  if (resp.playlist && Array.isArray(resp.playlist.items)) {
    candidates.push(...resp.playlist.items);
  }

  if (resp.continuationContents) {
    const cc = resp.continuationContents;
    if (Array.isArray(cc.contents)) candidates.push(...cc.contents);
    if (cc.playlistVideoListRenderer && Array.isArray(cc.playlistVideoListRenderer.contents)) {
      candidates.push(...cc.playlistVideoListRenderer.contents);
    }
  }

  if (resp.contents && typeof resp.contents === "object") {
    const scan = (obj) => {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj)) {
        obj.forEach(scan);
        return;
      }
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

  if (resp.parsed_runs && Array.isArray(resp.parsed_runs)) {
    candidates.push(...resp.parsed_runs);
  }

  return candidates.filter((it) => {
    if (!it) return false;
    if (it.videoId || it.id || it.type === "video") return true;
    if (it.video && (it.video.videoId || it.video.id)) return true;
    if (it.content && (it.content.videoId || it.content.id)) return true;
    if (it.videoRenderer || it.playlistVideoRenderer || it.gridVideoRenderer) return true;
    return false;
  });
}

module.exports = { extractText, _formatVideo, extractContinuation, extractVideoItems };