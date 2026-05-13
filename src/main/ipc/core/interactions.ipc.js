// src/main/ipc/interactions.js
//@ts-check
const { ipcMain } = require("electron");
// @ts-ignore
const path = require("path");
const youtubeService = require('../../../services/index');
const { logger } = require("../../../utils/logger");

function registerInteractionsHandlers() {
  ipcMain.handle("youtube:subscribe", async (_event, channelId) => {
    try {
      return await youtubeService.subscribe(channelId);
    } catch (err) {
      // @ts-ignore
      logger?.error?.("youtube:subscribe failed:", err);
      return { success: false };
    }
  });

  ipcMain.handle("youtube:unsubscribe", async (_event, channelId) => {
    try {
      return await youtubeService.unsubscribe(channelId);
    } catch (err) {
      // @ts-ignore
      logger?.error?.("youtube:unsubscribe failed:", err);
      return { success: false };
    }
  });

  ipcMain.handle("youtube:likeVideo", async (_event, videoId) => {
    try {
      return await youtubeService.likeVideo(videoId);
    } catch (err) {
      // @ts-ignore
      logger?.error?.("youtube:likeVideo failed:", err);
      return { success: false };
    }
  });

  ipcMain.handle("youtube:dislikeVideo", async (_event, videoId) => {
    try {
      return await youtubeService.dislikeVideo(videoId);
    } catch (err) {
      // @ts-ignore
      logger?.error?.("youtube:dislikeVideo failed:", err);
      return { success: false };
    }
  });

  ipcMain.handle("youtube:commentOnVideo", async (_event, videoId, text) => {
    try {
      return await youtubeService.commentOnVideo(videoId, text);
    } catch (err) {
      // @ts-ignore
      logger?.error?.("youtube:commentOnVideo failed:", err);
      return { success: false };
    }
  });
}

module.exports = { registerInteractionsHandlers };