// src/main/services/youtube.js
//@ts-check
const { Innertube, UniversalCache, ClientType } = require("youtubei.js");
const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const { logger } = require("../utils/logger");

// @ts-ignore
let innertube = null;

// ===================== STORAGE SETUP =====================
const userDataPath = app.getPath("userData");
const cacheDir = path.join(userDataPath, "youtube-cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

const credsFilePath = path.join(userDataPath, "youtube-credentials.json");

// @ts-ignore
function saveCredentials(credentials) {
  try {
    fs.writeFileSync(credsFilePath, JSON.stringify(credentials, null, 2));
    logger.info("✅ Credentials saved");
  } catch (err) {
    // @ts-ignore
    logger.error("Failed to save credentials:", err);
  }
}

function loadCredentials() {
  try {
    if (fs.existsSync(credsFilePath)) {
      return JSON.parse(fs.readFileSync(credsFilePath, "utf8"));
    }
  } catch (err) {
    // @ts-ignore
    logger.error("Failed to load credentials:", err);
  }
  return null;
}

function clearCredentials() {
  try {
    if (fs.existsSync(credsFilePath)) fs.unlinkSync(credsFilePath);
  } catch (err) {}
}

// ===================== HELPERS =====================
// @ts-ignore
function extractText(field) {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (field.text) return field.text;
  if (field.simpleText) return field.simpleText;
  // @ts-ignore
  if (field.runs?.length) return field.runs.map(r => r.text || "").join("");
  return "";
}

// @ts-ignore
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

  return {
    id: video.id || video.videoId || "",
    title: extractText(video.title),
    thumbnail: video.thumbnails?.[0]?.url || "",
    channelName: extractText(video.author?.name || video.channel?.name),
    channelId: video.author?.id || video.channel?.id || "",
    viewCount: extractText(video.view_count || video.viewCount) || "0",
    publishedDate: extractText(video.published?.text || video.uploadedDate),
    duration,
  };
}

// ===================== INNERTUBE =====================
async function getInnertube(forceNew = false) {
  // @ts-ignore
  if (!innertube || forceNew) {
    const saved = loadCredentials();
    innertube = await Innertube.create({
      // @ts-ignore
      cache: new UniversalCache(cacheDir),
      // @ts-ignore
      session: saved ? { credentials: saved } : undefined,
      clientType: ClientType.WEB,
    });
    logger.info("✅ Innertube instance created");
  }
  return innertube;
}

// @ts-ignore
function attachAuthListeners(yt) {
  // @ts-ignore
  yt.session.on("auth-pending", (data) => {
    logger.info(`🔑 Verification URL: ${data.verification_url}`);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send("auth:pending", {
        verificationUrl: data.verification_url,
        userCode: data.user_code,
      });
    }
  });

  // @ts-ignore
  yt.session.on("auth", async ({ credentials }) => {
    logger.info("✅ Authentication successful!");
    saveCredentials(credentials);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) mainWindow.webContents.send("auth:success", credentials);
  });

  // @ts-ignore
  yt.session.on("update-credentials", async ({ credentials }) => {
    logger.info("🔄 Credentials refreshed");
    saveCredentials(credentials);
  });
}

// ===================== AUTH =====================
async function authenticate() {
  // @ts-ignore
  if (innertube?.session.logged_in) return true;
  const yt = await getInnertube(true);
  attachAuthListeners(yt);
  try {
    await yt.session.signIn();
    return true;
  } catch (err) {
    // @ts-ignore
    logger.error("Sign-in failed:", err);
    return false;
  }
}

async function isLoggedIn() {
  const yt = await getInnertube();
  return yt.session.logged_in;
}

// ===================== VIDEO STREAMING =====================
// @ts-ignore
async function getVideoInfo(videoId) {
  const yt = await getInnertube();
  let info;
  let streamingData;

  try {
    info = await yt.getInfo(videoId, { client: ClientType.ANDROID });
    streamingData = info.streaming_data || info.streamingData;
  } catch (e) {
    info = await yt.getInfo(videoId, { client: ClientType.WEB });
    streamingData = info.streaming_data || info.streamingData;
  }

  if (!streamingData) throw new Error("No streaming data available");

  // @ts-ignore
  let format = streamingData.formats?.find(f => f.has_video && f.has_audio && f.url) ||
               // @ts-ignore
               streamingData.adaptive_formats?.find(f => f.has_video && f.url && f.mime_type?.includes("mp4")) ||
               // @ts-ignore
               streamingData.adaptive_formats?.find(f => f.has_video && f.url);

  if (!format?.url) throw new Error("No playable format found");

  logger.info(`✅ Selected format: ${format.quality_label || format.itag}`);

  return {
    format: { url: format.url, mimeType: format.mime_type || "video/mp4", qualityLabel: format.quality_label || "720p" },
    title: extractText(info.basic_info?.title || info.title),
    channel: extractText(info.basic_info?.author),
  };
}

// @ts-ignore
async function getVideoStreamingUrl(videoId) {
  const { format } = await getVideoInfo(videoId);
  return format.url;
}

// ===================== FIXED RECOMMENDED / RELATED VIDEOS =====================
// @ts-ignore
async function getRelatedVideos(videoId) {
  const yt = await getInnertube();
  const info = await yt.getInfo(videoId);

  let related = [];

  // @ts-ignore
  logger.debug("Related extraction - keys available:", Object.keys(info));

  // 1. Best source: watch_next_feed
  if (info.watch_next_feed?.length) {
    // @ts-ignore
    related = info.watch_next_feed.filter(item => 
      item.type === "Video" || item.type === "CompactVideo"
    );
    logger.info(`Found ${related.length} from watch_next_feed`);
  }

  // 2. Secondary results
  if (related.length === 0 && info.contents?.twoColumnWatchNextResults?.secondaryResults?.results) {
    const secondary = info.contents.twoColumnWatchNextResults.secondaryResults.results;
    related = secondary
      // @ts-ignore
      .map(item => item.compactVideoRenderer || item)
      .filter(Boolean);
    logger.info(`Found ${related.length} from secondaryResults`);
  }

  // 3. Autoplay
  if (related.length === 0 && info.autoplay) {
    related = Array.isArray(info.autoplay) ? info.autoplay : [];
    logger.info(`Found ${related.length} from autoplay`);
  }

  // 4. Rich grid or contents fallback
  if (related.length === 0 && info.contents?.richGridContents) {
    related = info.contents.richGridContents
      .flat()
      // @ts-ignore
      .filter(item => item.type === "Video" || item.type === "CompactVideo");
  }

  // 5. Ultimate fallback - search by title
  if (related.length === 0) {
    const title = extractText(info.basic_info?.title || info.title);
    if (title) {
      logger.info(`Search fallback for related: ${title}`);
      const search = await yt.search(title);
      // @ts-ignore
      related = (search.results || []).filter(item => 
        item.type === "Video" && item.id !== videoId
      ).slice(0, 20);
    }
  }

  const formatted = related
    // @ts-ignore
    .map(item => _formatVideo(item))
    // @ts-ignore
    .filter(v => v && v.id && v.id !== videoId)
    .slice(0, 20);

  logger.info(`✅ Final related videos returned: ${formatted.length}`);
  return formatted;
}

// ===================== OTHER METHODS =====================
async function getHomeFeed() {
  const yt = await getInnertube();
  const feed = await yt.getHomeFeed();
  // @ts-ignore
  const videos = feed.contents?.filter(item => item.type === "Video") || [];
  return videos.map(_formatVideo).filter(Boolean);
}

// @ts-ignore
async function searchVideos(query) {
  const yt = await getInnertube();
  const result = await yt.search(query);
  // @ts-ignore
  const videos = (result.results || result.items || []).filter(item => item.type === "Video");
  return videos.map(_formatVideo).filter(Boolean);
}

async function getTrendingVideos() {
  return searchVideos("trending");
}

// @ts-ignore
async function getVideoComments(videoId) {
  const yt = await getInnertube();
  const comments = await yt.getComments(videoId);
  return (comments?.contents || [])
    // @ts-ignore
    .map((thread) => {
      const c = thread.comment;
      if (!c) return null;
      return {
        id: c.id,
        author: extractText(c.author?.name),
        text: extractText(c.content),
        likes: c.like_count || 0,
        publishedDate: extractText(c.published),
      };
    })
    .filter(Boolean);
}

// @ts-ignore
async function getChannelInfo(channelId) {
  const yt = await getInnertube();
  const channel = await yt.getChannel(channelId);
  return {
    id: channel.id,
    name: extractText(channel.title),
    description: extractText(channel.description),
    avatar: channel.avatar?.url,
    banner: channel.banner?.url,
    subscriberCount: extractText(channel.subscriber_count) || "0",
  };
}

// @ts-ignore
async function getChannelVideos(channelId) {
  const yt = await getInnertube();
  const channel = await yt.getChannel(channelId);
  const videos = await channel.getVideos();
  return videos.map(_formatVideo).filter(Boolean);
}

// @ts-ignore
async function getChannelPlaylists(channelId) {
  const yt = await getInnertube();
  const channel = await yt.getChannel(channelId);
  const playlists = await channel.getPlaylists();
  // @ts-ignore
  return playlists.map((p) => ({
    id: p.id,
    title: extractText(p.title),
    thumbnail: p.thumbnails?.[0]?.url,
    videoCount: parseInt(extractText(p.video_count), 10) || 0,
  }));
}

async function getSubscriptionsFeed() {
  const yt = await getInnertube();
  if (!yt.session.logged_in) return [];
  const feed = await yt.getSubscriptionsFeed();
  // @ts-ignore
  const videos = feed.contents?.filter(item => item.type === "Video") || [];
  return videos.map(_formatVideo).filter(Boolean);
}

async function getUserPlaylists() {
  const yt = await getInnertube();
  if (!yt.session.logged_in) return [];
  const playlists = await yt.getPlaylists();
  // @ts-ignore
  return playlists.map((p) => ({
    id: p.id,
    title: extractText(p.title),
    thumbnail: p.thumbnails?.[0]?.url,
    videoCount: parseInt(extractText(p.video_count), 10) || 0,
  }));
}

// @ts-ignore
async function getPlaylistVideos(playlistId) {
  const yt = await getInnertube();
  const playlist = await yt.getPlaylist(playlistId);
  return playlist.videos.items.map(_formatVideo).filter(Boolean);
}

// @ts-ignore
async function authenticateWithCookies(cookie) {
  try {
    // @ts-ignore
    const yt = await Innertube.create({ cache: new UniversalCache(cacheDir), cookie });
    innertube = yt;
    return yt.session.logged_in;
  } catch (e) {
    // @ts-ignore
    logger.error("Cookie auth failed:", e.message);
    return false;
  }
}

// ===================== EXPORTS =====================
module.exports = {
  authenticate,
  authenticateWithCookies,
  isLoggedIn,
  getHomeFeed,
  getTrendingVideos,
  searchVideos,
  getVideoInfo,
  getVideoStreamingUrl,
  getVideoComments,
  getChannelInfo,
  getChannelVideos,
  getChannelPlaylists,
  getSubscriptionsFeed,
  getUserPlaylists,
  getPlaylistVideos,
  getRelatedVideos,
  clearCredentials,
};