
const { ipcMain } = require('electron');
const youtubeService = require('../../../services/index');

function registerWatchLaterHandlers() {
  ipcMain.handle('youtube:getWatchLaterVideos', async (event, continuation) => {
    return await youtubeService.getWatchLaterVideos(continuation);
  });
}

module.exports = { registerWatchLaterHandlers };