//@ts-check
const core = require("./core");
const { BrowserWindow, shell } = require("electron");
const { logger } = require("../utils/logger");

let authPromise = null;

function getMainWindow() {
  const win = BrowserWindow.getAllWindows()[0];
  return win;
}

function safeSend(channel, payload) {
  const win = getMainWindow();
  if (win && win.webContents && typeof win.webContents.send === "function") {
    try {
      win.webContents.send(channel, payload);
    } catch (err) {
      logger.debug("Failed to send IPC message:", channel, err.message);
    }
  }
}

async function authenticate(opts = {}) {
  if (authPromise) return authPromise;
  authPromise = _authenticate(opts);
  try {
    return await authPromise;
  } finally {
    authPromise = null;
  }
}

async function _authenticate(opts = {}) {
  const { timeoutMs = 5 * 60 * 1000 } = opts;

  const yt = await core.getInnertube(true);
  if (!yt || !yt.session) {
    const msg = "Innertube or session unavailable for authentication";
    logger.error(msg);
    throw new Error(msg);
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        logger.warn("Authentication timed out after", timeoutMs, "ms");
        cleanup();
        reject(new Error("Authentication timed out"));
      }
    }, timeoutMs);

    const onAuthPending = (data) => {
      logger.info("auth-pending event received");
      const verificationUrl =
        data.verification_url ||
        data.verificationUrl ||
        data.verificationURI ||
        null;

      if (verificationUrl) {
        const separator = verificationUrl.includes("?") ? "&" : "?";
        const urlWithCode = `${verificationUrl}${separator}user_code=${data.user_code || ""}`;
        shell.openExternal(urlWithCode).catch((e) => logger.warn("shell.openExternal failed:", e.message));
        safeSend("auth:pending", { verificationUrl, userCode: data.user_code });
      }
    };

    const onAuth = async (event) => {
      logger.info("auth event received");
      try {
        if (event?.credentials) {
          core.saveCredentials(event.credentials);
        } else {
          const creds =
            typeof yt.session.exportCredentials === "function"
              ? await yt.session.exportCredentials()
              : yt.session.credentials;
          if (creds) core.saveCredentials(creds);
        }

        if (!settled) {
          settled = true;
          cleanup();
          resolve(event?.credentials || yt.session.credentials || { success: true });
          safeSend("auth:success", event?.credentials || {});
        }
      } catch (err) {
        if (!settled) {
          settled = true;
          cleanup();
          reject(err);
        }
      }
    };

    const onAuthError = (err) => {
      if (!settled) {
        settled = true;
        logger.error("Authentication error event:", err && err.message ? err.message : err);
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      if (yt.session.off) {
        yt.session.off("auth-pending", onAuthPending);
        yt.session.off("auth", onAuth);
        yt.session.off("auth-error", onAuthError);
      } else if (yt.session.removeListener) {
        yt.session.removeListener("auth-pending", onAuthPending);
        yt.session.removeListener("auth", onAuth);
        yt.session.removeListener("auth-error", onAuthError);
      }
    };

    if (yt.session.on) {
      yt.session.on("auth-pending", onAuthPending);
      yt.session.on("auth", onAuth);
      yt.session.on("auth-error", onAuthError);
    } else {
      reject(new Error("Session interface incompatible"));
      return;
    }

    (async () => {
      try {
        logger.info("Auth flow: starting signIn()");
        await yt.session.signIn();
        logger.info("signIn() resolved");
        if (!settled) {
          setTimeout(() => {
            if (!settled) {
              logger.info("No 'auth' event after signIn, resolving with current session");
              settled = true;
              cleanup();
              resolve(yt.session.credentials || { success: true });
            }
          }, 2000);
        }
      } catch (err) {
        if (!settled) {
          logger.error("signIn() error:", err && err.message ? err.message : err);
          cleanup();
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      }
    })();
  });
}

async function isLoggedIn() {
  try {
    const savedCreds = core.loadCredentials();
    if (savedCreds?.oauth2_tokens?.expiry_date) {
      const expiry = new Date(savedCreds.oauth2_tokens.expiry_date);
      if (expiry.getTime() > Date.now()) return true;
    }
    const yt = await core.getInnertube();
    if (!yt?.session) return false;
    if (typeof yt.session.logged_in === "boolean") return yt.session.logged_in;
    if (typeof yt.session.isLoggedIn === "function") return !!yt.session.isLoggedIn();
    return !!yt.session.credentials;
  } catch (err) {
    logger.debug("isLoggedIn check failed:", err.message);
    return false;
  }
}

/**
 * Get current user info (name, avatar, channel id) from YouTube session.
 */
async function getUserInfo() {
  try {
    const yt = await core.getInnertube();
    if (!yt?.session || !yt.session.logged_in) return null;
    
    // Try to get account info – method may vary per youtubei.js version
    if (typeof yt.session.getAccountInfo === "function") {
      const account = await yt.session.getAccountInfo();
      return {
        name: account.name || null,
        email: account.email || null,
        avatar: account.avatar?.url || null,
        channelId: account.channel_id || null,
      };
    }
    
    // Fallback: get from basic info
    const basic = yt.session.credentials?.oauth2_tokens;
    return {
      name: null,
      email: basic?.email || null,
      avatar: null,
      channelId: null,
    };
  } catch (err) {
    logger.error("getUserInfo failed:", err.message);
    return null;
  }
}

async function signOut() {
  try {
    const yt = await core.getInnertube();
    if (!yt?.session) {
      logger.warn("No session available to sign out");
      return;
    }
    await yt.session.signOut();
    core.clearCredentials();
    core.clearCookie();
    core.resetInnertube();
  } catch (err) {
    logger.error("Sign out failed:", err.message);
  }
}

module.exports = { authenticate, isLoggedIn, getUserInfo, signOut };