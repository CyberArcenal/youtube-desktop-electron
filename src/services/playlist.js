// src/main/services/youtube/playlist.js
const core = require("./core");
const { _formatVideo } = require("./utils");

async function getUserPlaylists() {
  const yt = await core.getInnertube();
  if (!yt.session.logged_in) return [];
  const playlists = await yt.getPlaylists();
  return playlists.map(p => ({
    id: p.id,
    title: require("./utils").extractText(p.title),
    thumbnail: p.thumbnails?.[0]?.url,
    videoCount: parseInt(require("./utils").extractText(p.video_count), 10) || 0,
  }));
}

async function getPlaylistVideos(playlistId) {
  const yt = await core.getInnertube();
  const playlist = await yt.getPlaylist(playlistId);
  return playlist.videos.items.map(_formatVideo).filter(Boolean);
}

module.exports = { getUserPlaylists, getPlaylistVideos };