// src/main/services/youtube/auth.js
const core = require("./core");
const { BrowserWindow } = require("electron");
const { logger } = require("../utils/logger");

async function authenticate() {
  const yt = await core.getInnertube(true); // force new for sign‑in

  yt.session.on("auth-pending", (data) => {
    logger.info(`🔑 Verification URL: ${data.verification_url}`);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send("auth:pending", {
        verificationUrl: data.verification_url,
        userCode: data.user_code,
      });
    }
  });

  yt.session.on("auth", async ({ credentials }) => {
    logger.info("✅ Auth successful!");
    core.saveCredentials(credentials);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) mainWindow.webContents.send("auth:success", credentials);
  });

  try {
    await yt.session.signIn();
    return true;
  } catch (err) {
    logger.error("Sign‑in failed:", err);
    return false;
  }
}

async function isLoggedIn() {
  const yt = await core.getInnertube(); // uses cached or restored instance
  return yt.session.logged_in;
}

module.exports = { authenticate, isLoggedIn };