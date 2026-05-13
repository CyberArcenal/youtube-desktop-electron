// src/main/services/youtube/auth.js
const core = require("./core");
const { BrowserWindow, session: electronSession } = require("electron");
const { logger } = require("../utils/logger");

let loginWindow = null;
let isRefreshing = false;
/**
 * Extract all cookies that matter for YouTube authentication from a given session
 * and also merge with the default session to catch everything.
 * Returns a cookie string or null.
 */

async function extractAllRelevantCookies(targetSession) {
  try {
    const targetCookies = await targetSession.cookies.get({});
    const defaultCookies = await electronSession.defaultSession.cookies.get({});
    const allCookies = [...targetCookies, ...defaultCookies];

    const relevant = allCookies.filter((c) => {
      const d = (c.domain || "").toLowerCase();
      return (
        d.includes("youtube") ||
        d.includes("google") ||
        d.includes("gstatic") ||
        d.includes("ytimg")
      );
    });

    const cookieMap = new Map();
    relevant.forEach((c) => {
      const key = `${c.name}|${c.domain}`;
      const existing = cookieMap.get(key);
      if (
        !existing ||
        (c.expirationDate || 0) > (existing.expirationDate || 0)
      ) {
        cookieMap.set(key, c);
      }
    });

    const cookieString = Array.from(cookieMap.values())
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    // Log which key cookies are present for debugging
    const hasSapisid = cookieString.includes("SAPISID");
    const hasLoginInfo = cookieString.includes("LOGIN_INFO");
    const hasSsid = cookieString.includes("SSID");
    const hasHsid = cookieString.includes("HSID");
    logger.info(
      `✅ Extracted ${cookieMap.size} cookies. SAPISID: ${hasSapisid}, LOGIN_INFO: ${hasLoginInfo}, SSID: ${hasSsid}, HSID: ${hasHsid}`,
    );

    if (!hasSapisid)
      logger.warn("⚠️ SAPISID cookie is missing! Login may fail.");
    if (!hasLoginInfo)
      logger.warn("⚠️ LOGIN_INFO cookie is missing! YouTube auth may fail.");

    return cookieString;
  } catch (err) {
    logger.error("Cookie extraction failed:", err);
    return null;
  }
}

/**
 * Refresh cookies from the current default session,
 * save them, and recreate Innertube instance.
 * Returns true if successful, false otherwise.
 */

async function refreshCookiesFromCurrentSession() {
  if (isRefreshing) {
    logger.info("Cookie refresh already in progress, skipping...");
    return false;
  }
  isRefreshing = true;
  try {
    const cookieString = await extractAllRelevantCookies(
      electronSession.defaultSession,
    );
    if (!cookieString) {
      logger.warn("No cookies extracted from default session.");
      return false;
    }

    core.saveCookie(cookieString);
    core.resetInnertube();

    const newInnertube = await core.getInnertube(true);
    const account = await newInnertube.account.getInfo().catch(() => null);

    if (account?.name) {
      logger.info(`✅ Successfully logged in as: ${account.name}`);
      const mainWin = BrowserWindow.getAllWindows()[0];
      if (mainWin) {
        mainWin.webContents.send("auth:success", {
          message: `Logged in as ${account.name}`,
          user: { name: account.name, avatar: account.thumbnails?.[0]?.url },
        });
        mainWin.webContents.send("youtube:refresh-feed");
      }
      return true;
    } else {
      logger.warn("Cookie saved but account info still unavailable.");
      return false;
    }
  } catch (err) {
    logger.error("Failed to extract cookies from session:", err.message);
    return false;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Main authentication function.
 * Tries to restore from existing session first.
 * If that fails, opens a login window.
 */
async function authenticate() {
  // First, try to restore cookies from the live session
  const restored = await refreshCookiesFromCurrentSession();
  if (restored) {
    return { success: true, message: "Session restored" };
  }

  // No valid session – open a login window
  logger.info("🔐 Opening YouTube Login Window...");

  loginWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: "YouTube Login",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  await loginWindow.loadURL(
    "https://accounts.google.com/signin/v2/identifier?service=youtube&continue=https%3A%2F%2Fwww.youtube.com",
  );

  // src/main/services/youtube/auth.js – modify `authenticate` function

  // Inside the login window's did-navigate handler, replace the extraction block:

  loginWindow.webContents.on("did-navigate", async (event, url) => {
    if (url.includes("youtube.com") && !url.includes("accounts.google.com")) {
      logger.info(
        "User navigated to YouTube, waiting for cookies to stabilize...",
      );

      // Wait 2 seconds for any async cookie setting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Optional: wait for the page to fully load
      await loginWindow.webContents.executeJavaScript(
        'document.readyState === "complete"',
      );

      logger.info("Extracting cookies after stabilization");
      const cookieString = await extractAllRelevantCookies(
        loginWindow.webContents.session,
      );

      // Verify essential cookies exist
      if (
        cookieString &&
        cookieString.includes("SAPISID") &&
        cookieString.includes("LOGIN_INFO")
      ) {
        core.saveCookie(cookieString);
        core.resetInnertube();

        // Force recreate Innertube and verify account
        const yt = await core.getInnertube(true);
        const account = await yt.account.getInfo().catch(() => null);
        if (account?.name) {
          logger.info(`✅ Successfully logged in as: ${account.name}`);
          const mainWin = BrowserWindow.getAllWindows()[0];
          if (mainWin) {
            mainWin.webContents.send("auth:success", {
              message: `Welcome, ${account.name}!`,
              user: {
                name: account.name,
                avatar: account.thumbnails?.[0]?.url,
              },
            });
            mainWin.webContents.send("youtube:refresh-feed");
          }
          if (loginWindow) loginWindow.close();
        } else {
          logger.error(
            "Cookie saved but account info still unavailable – login may have failed",
          );
        }
      } else {
        logger.error("Missing required cookies (SAPISID or LOGIN_INFO)");
      }
    }
  });

  loginWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      if (errorCode === -3) {
        logger.warn("Load aborted, retrying login page...");
        if (loginWindow && !loginWindow.isDestroyed()) {
          loginWindow.loadURL(
            "https://accounts.google.com/signin/v2/identifier?service=youtube&continue=https%3A%2F%2Fwww.youtube.com",
          );
        }
      }
    },
  );

  loginWindow.on("closed", () => {
    loginWindow = null;
  });

  return { success: true, message: "Login window opened" };
}

// Helper for manual cookie save
async function saveProvidedCookie(cookieString) {
  return core.saveCookie(cookieString);
}

async function isLoggedIn() {
  try {
    const cookie = core.loadCookie();
    return !!cookie;
  } catch {
    return false;
  }
}

async function getUserInfo() {
  try {
    const yt = await core.getInnertube();
    const account = await yt.account.getInfo().catch(() => null);
    return account
      ? {
          name: account.name,
          avatar: account.thumbnails?.[0]?.url,
          isLoggedIn: true,
        }
      : null;
  } catch (err) {
    logger.debug("getUserInfo failed:", err.message);
    return null;
  }
}

async function signOut() {
  core.clearCookie();
  core.resetInnertube();
  // Notify renderer to clear user info
  const mainWin = BrowserWindow.getAllWindows()[0];
  if (mainWin) {
    mainWin.webContents.send("auth:signout");
    mainWin.webContents.send("youtube:refresh-feed");
  }
  return true;
}

module.exports = {
  authenticate,
  saveProvidedCookie,
  isLoggedIn,
  getUserInfo,
  signOut,
  refreshCookiesFromCurrentSession,
};
