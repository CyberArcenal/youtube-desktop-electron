// src/main/services/youtube/utils.js
function extractText(field) {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (field.text) return field.text;
  if (field.simpleText) return field.simpleText;
  if (field.runs?.length) return field.runs.map(r => r.text || "").join("");
  return "";
}

// src/main/services/youtube/utils.js
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

  // Subukan lahat ng posibleng thumbnail sources
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

module.exports = { extractText, _formatVideo };