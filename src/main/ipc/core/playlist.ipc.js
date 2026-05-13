
const { ipcMain } = require('electron');
const youtubeService = require('../../../services/index');

function registerPlaylistHandlers() {
  ipcMain.handle('youtube:getUserPlaylists', async () => {
    return await youtubeService.getUserPlaylists();
  });

  ipcMain.handle('youtube:getPlaylistVideos', async (event, playlistId) => {
    return await youtubeService.getPlaylistVideos(playlistId);
  });
}

module.exports = { registerPlaylistHandlers };