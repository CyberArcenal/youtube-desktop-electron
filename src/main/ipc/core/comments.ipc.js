
const { ipcMain } = require('electron');
const youtubeService = require('../../../services/index');

function registerCommentsHandlers() {
  ipcMain.handle('youtube:getCommentsInitial', async (event, videoId) => {
    return await youtubeService.getVideoCommentsWithToken(videoId);
  });

  ipcMain.handle('youtube:getMoreComments', async (event, videoId, continuation) => {
    return await youtubeService.getMoreComments(videoId, continuation);
  });

  ipcMain.handle('youtube:replyToComment', async (event, commentId, text) => {
    return await youtubeService.replyToComment(commentId, text);
  });

  ipcMain.handle('youtube:likeComment', async (event, commentId) => {
    return await youtubeService.likeComment(commentId);
  });
}

module.exports = { registerCommentsHandlers };