
const { ipcMain } = require('electron');
const youtubeService = require('../../../services/index');

function registerChannelHandlers() {
  ipcMain.handle('youtube:getChannelInfo', async (event, channelId) => {
    return await youtubeService.getChannelInfo(channelId);
  });

  ipcMain.handle('youtube:getChannelVideos', async (event, channelId) => {
    return await youtubeService.getChannelVideos(channelId);
  });

  ipcMain.handle('youtube:getChannelPlaylists', async (event, channelId) => {
    return await youtubeService.getChannelPlaylists(channelId);
  });
}

module.exports = { registerChannelHandlers };