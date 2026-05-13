
const { ipcMain } = require('electron');
const youtubeService = require('../../../services/index');

function registerSearchHandlers() {
  ipcMain.handle('youtube:search', async (event, query, continuation) => {
    return await youtubeService.searchVideos(query, continuation);
  });
}

module.exports = { registerSearchHandlers };