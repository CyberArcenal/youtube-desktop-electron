// src/main/services/youtube/core.js
const { Innertube, UniversalCache, ClientType } = require("youtubei.js");
const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const { logger } = require("../utils/logger");

const userDataPath = app.getPath("userData");
const cacheDir = path.join(userDataPath, "youtube-cache");
const credsFilePath = path.join(userDataPath, "youtube-credentials.json");

if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

let innertube = null;

// ---------- Save / Load Credentials ----------
function saveCredentials(credentials) {
  try {
    if (!credentials) return;
    // Convert Date to number for JSON
    const cleaned = JSON.parse(JSON.stringify(credentials, (key, value) => {
      if (value instanceof Date) return value.getTime();
      if (value === undefined) return null;
      return value;
    }));
    fs.writeFileSync(credsFilePath, JSON.stringify(cleaned, null, 2));
    logger.info("✅ Credentials saved");
  } catch (err) {
    logger.error("Failed to save credentials:", err.message);
  }
}

function loadCredentials() {
  try {
    if (fs.existsSync(credsFilePath)) {
      const data = JSON.parse(fs.readFileSync(credsFilePath, "utf8"));
      // ✅ Convert expiry_date back to Date object (critical for session restoration)
      if (data.expiry_date && typeof data.expiry_date === "number") {
        data.expiry_date = new Date(data.expiry_date);
      }
      return data;
    }
  } catch (err) {
    logger.warn("Failed to load credentials:", err.message);
  }
  return null;
}

// ---------- Manual Token Refresh ----------
async function refreshSession(yt) {
  if (!yt || !yt.session) return false;
  try {
    // Try both possible method names
    if (typeof yt.session.refresh === "function") {
      await yt.session.refresh();
    } else if (typeof yt.session.refreshAccessToken === "function") {
      await yt.session.refreshAccessToken();
    } else {
      return false;
    }
    return yt.session.logged_in;
  } catch (err) {
    logger.warn("Token refresh failed:", err.message);
    return false;
  }
}

// ---------- Innertube Factory ----------
async function getInnertube(forceNew = false) {
  if (!innertube || forceNew) {
    const saved = loadCredentials();

    if (saved) {
      logger.info("🔄 Loading saved credentials...");
      try {
        innertube = await Innertube.create({
          cache: new UniversalCache(cacheDir),
          session: { credentials: saved },
          clientType: ClientType.WEB,
        });

        if (!innertube.session.logged_in) {
          logger.info("⚠️ Session expired – attempting refresh...");
          const refreshed = await refreshSession(innertube);
          if (refreshed) {
            logger.info("✅ Session restored after refresh");
            if (innertube.session.credentials) {
              saveCredentials(innertube.session.credentials);
            }
          } else {
            logger.warn("❌ Refresh failed – credentials cleared");
            clearCredentials();
            // Create a fresh unauthenticated instance
            innertube = await Innertube.create({
              cache: new UniversalCache(cacheDir),
              clientType: ClientType.WEB,
            });
          }
        } else {
          logger.info("✅ Session restored (logged in)");
        }
      } catch (err) {
        logger.error("Failed to restore session:", err.message);
        clearCredentials();
        innertube = await Innertube.create({
          cache: new UniversalCache(cacheDir),
          clientType: ClientType.WEB,
        });
      }
    } else {
      logger.info("🔧 No saved credentials – creating fresh instance");
      innertube = await Innertube.create({
        cache: new UniversalCache(cacheDir),
        clientType: ClientType.WEB,
      });
    }

    // Listen for automatic token refreshes during runtime
    innertube.session.on("auth", (event) => {
      if (event.credentials) {
        saveCredentials(event.credentials);
        logger.info("🔄 Credentials updated via auth event");
      }
    });
  }
  return innertube;
}

function clearCredentials() {
  try {
    if (fs.existsSync(credsFilePath)) fs.unlinkSync(credsFilePath);
    logger.info("🗑️ Credentials cleared");
  } catch (err) {}
}

module.exports = {
  getInnertube,
  saveCredentials,
  loadCredentials,
  clearCredentials,
};