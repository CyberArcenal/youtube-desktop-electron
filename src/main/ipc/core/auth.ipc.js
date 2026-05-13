//@ts-check
const { ipcMain } = require('electron');
const auth = require('../../../services/auth');

function registerAuthHandlers() {
  ipcMain.handle('youtube:authenticate', async () => {
    await auth.authenticate();
    return { success: true };
  });

  ipcMain.handle('youtube:isLoggedIn', async () => {
    return await auth.isLoggedIn();
  });

  ipcMain.handle('youtube:signOut', async () => {
    await auth.signOut();
    return { success: true };
  });

  ipcMain.handle('youtube:getUserInfo', async () => {
  return await auth.getUserInfo();
});

}



module.exports = { registerAuthHandlers };