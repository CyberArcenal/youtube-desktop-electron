// src/main/services/youtube/player.js
const core = require("./core");
const { logger } = require("../utils/logger");

async function getVideoInfo(videoId) {
  const yt = await core.getInnertube();

  let info = null;
  let streamingData = null;

  const clients = ["ANDROID", "TV_EMBEDDED", "WEB"];

  for (const clientType of clients) {
    try {
      logger.info(`[Player] Trying ${clientType} for ${videoId}`);
      info = await yt.getInfo(videoId, { client: clientType });
      streamingData = info.streaming_data || info.streamingData;

      if (streamingData?.formats?.length || streamingData?.adaptive_formats?.length) {
        logger.info(`[Player] ${clientType} succeeded`);
        break;
      }
    } catch (e) {
      logger.warn(`[Player] ${clientType} failed`);
    }
  }

  if (!streamingData) {
    throw new Error("No streaming data available. Video may be restricted or unavailable.");
  }

  let format = streamingData.formats?.find(f => f.has_video && f.has_audio && f.url) ||
               streamingData.adaptive_formats?.find(f => f.has_video && f.url && f.mime_type?.includes("mp4")) ||
               streamingData.adaptive_formats?.find(f => f.has_video && f.url);

  if (!format?.url) {
    throw new Error("No playable format found");
  }

  logger.info(`✅ Selected format: ${format.quality_label || format.itag}`);
  
  return {
    format: {
      url: format.url,
      mimeType: format.mime_type || "video/mp4",
      qualityLabel: format.quality_label || "720p"
    },
    title: info.basic_info?.title || "",
    channel: info.basic_info?.author || "",
  };
}

/**
 * Convenience function to get only the streaming URL.
 * Uses getVideoInfo internally.
 */
async function getVideoStreamingUrl(videoId) {
  const { format } = await getVideoInfo(videoId);
  return format.url;
}

module.exports = { getVideoInfo, getVideoStreamingUrl };