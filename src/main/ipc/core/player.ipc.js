
const { ipcMain } = require('electron');
const youtubeService = require('../../../services/index');

function registerPlayerHandlers() {
  ipcMain.handle('youtube:getVideoInfo', async (event, videoId) => {
    return await youtubeService.getVideoInfo(videoId);
  });

  ipcMain.handle('youtube:getStreamingUrl', async (event, videoId) => {
    return await youtubeService.getVideoStreamingUrl(videoId);
  });
}

module.exports = { registerPlayerHandlers };