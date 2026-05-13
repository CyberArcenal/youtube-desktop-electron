
const { ipcMain } = require('electron');
const youtubeService = require('../../../services/index');

function registerFeedHandlers() {
  ipcMain.handle('youtube:getHomeFeed', async (event, continuation) => {
    return await youtubeService.getHomeFeed(continuation);
  });

  ipcMain.handle('youtube:getSubscriptionsFeed', async (event, continuation) => {
    return await youtubeService.getSubscriptionsFeed(continuation);
  });

  ipcMain.handle('youtube:getTrendingVideos', async (event, continuation) => {
    return await youtubeService.getTrendingVideos(continuation);
  });
}

module.exports = { registerFeedHandlers };