
const { ipcMain } = require('electron');
const youtubeService = require('../../../services/index');

function registerHistoryHandlers() {
  ipcMain.handle('youtube:getWatchHistory', async (event, continuation) => {
    return await youtubeService.getWatchHistory(continuation);
  });
}

module.exports = { registerHistoryHandlers };