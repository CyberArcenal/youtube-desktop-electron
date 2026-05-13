
const { ipcMain } = require('electron');
const youtubeService = require('../../../services/index');

function registerRelatedHandlers() {
  ipcMain.handle('youtube:getRelatedVideos', async (event, videoId) => {
    return await youtubeService.getRelatedVideos(videoId);
  });
}

module.exports = { registerRelatedHandlers };