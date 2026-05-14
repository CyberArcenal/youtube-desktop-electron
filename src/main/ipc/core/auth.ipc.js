//@ts-check
const { ipcMain } = require('electron');
// ✅ Use the YouTube auth service, not the generic app auth
const youtubeAuth = require('../../../services/auth');

function registerAuthHandlers() {
  ipcMain.handle('youtube:authenticate', async () => {
    await youtubeAuth.authenticate();
    return { success: true };
  });

  ipcMain.handle('youtube:isLoggedIn', async () => {
    return await youtubeAuth.isLoggedIn();
  });

  ipcMain.handle('youtube:signOut', async () => {
    await youtubeAuth.signOut();
    return { success: true };
  });

  ipcMain.handle('youtube:getUserInfo', async () => {
    return await youtubeAuth.getUserInfo();
  });
}

module.exports = { registerAuthHandlers };