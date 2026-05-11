// src/main/services/youtube/channel.js
const core = require("./core");
const { extractText } = require("./utils");

async function getChannelInfo(channelId) {
  const yt = await core.getInnertube();
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

async function getChannelVideos(channelId) {
  const yt = await core.getInnertube();
  const channel = await yt.getChannel(channelId);
  const videos = await channel.getVideos();
  return videos.map(require("./utils")._formatVideo).filter(Boolean);
}

async function getChannelPlaylists(channelId) {
  const yt = await core.getInnertube();
  const channel = await yt.getChannel(channelId);
  const playlists = await channel.getPlaylists();
  return playlists.map(p => ({
    id: p.id,
    title: require("./utils").extractText(p.title),
    thumbnail: p.thumbnails?.[0]?.url,
    videoCount: parseInt(require("./utils").extractText(p.video_count), 10) || 0,
  }));
}

module.exports = { getChannelInfo, getChannelVideos, getChannelPlaylists };