
//@ts-check
const { ipcMain } = require('electron');
const notifications = require('../../../services/notifications');

function registerNotificationHandlers() {
  ipcMain.handle('notification:getAll', async (event, { continuation, limit }) => {
    const result = await notifications.getNotifications(continuation, limit || 20);
    return { status: true, data: result.notifications, continuation: result.continuation };
  });

  ipcMain.handle('notification:getUnreadCount', async () => {
    const count = await notifications.getUnreadNotificationCount();
    return { status: true, data: count };
  });

  ipcMain.handle('notification:markAsRead', async (event, id) => {
    await notifications.markNotificationAsRead(id);
    return { status: true };
  });

  ipcMain.handle('notification:markAllAsRead', async () => {
    await notifications.markAllNotificationsAsRead();
    return { status: true };
  });

  ipcMain.handle('notification:delete', async (event, id) => {
    await notifications.deleteNotification(id);
    return { status: true };
  });
}

module.exports = { registerNotificationHandlers };