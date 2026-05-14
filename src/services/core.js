const { Innertube, UniversalCache, ClientType } = require("youtubei.js");
const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const { logger } = require("../utils/logger");

process.on("warning", (warning) => {
  if (
    warning &&
    (warning.name === "ParsingError" ||
      (warning.message &&
        warning.message.includes("HypeFanCreditsSectionView")))
  ) {
    return;
  }
  logger.warn(warning.name, warning.message);
});

const userDataPath = app.getPath("userData");
const cacheDir = path.join(userDataPath, "youtube-cache");
const credsFilePath = path.join(userDataPath, "youtube-credentials.json");
const cookiePath = path.join(userDataPath, "youtube-cookie.json");

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

let innertube = null;

function atomicWriteFileSync(filePath, data, mode = 0o600) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.tmp-${process.pid}-${Date.now()}`);
  fs.writeFileSync(tmp, data, { encoding: "utf8", mode });
  fs.renameSync(tmp, filePath);
}

// Removed restoreSessionFromSaved - credentials are loaded via create() options

function saveCredentials(credentials) {
  try {
    if (!credentials) {
      logger.warn("⚠️ saveCredentials called with empty credentials");
      return;
    }
    const clean = JSON.parse(
      JSON.stringify(credentials, (key, value) => {
        if (value instanceof Date) return value.getTime();
        if (value === undefined) return null;
        return value;
      })
    );
    const payload = JSON.stringify(clean, null, 2);
    atomicWriteFileSync(credsFilePath, payload, 0o600);
    logger.info("✅ Credentials saved to " + credsFilePath);
  } catch (err) {
    logger.error("❌ Failed to save credentials:", err.message);
  }
}

function saveCookie(cookieString) {
  try {
    if (!cookieString) {
      logger.debug("saveCookie called with empty cookieString");
      return;
    }
    logger.info(`Saving cookie of length ${cookieString.length}`);
    const payload = JSON.stringify({ cookie: cookieString });
    atomicWriteFileSync(cookiePath, payload, 0o600);
    logger.info("✅ YouTube cookie saved");
  } catch (err) {
    logger.error("❌ Failed to save cookie:", err.message);
  }
}

function loadCookie() {
  try {
    if (fs.existsSync(cookiePath)) {
      const data = JSON.parse(fs.readFileSync(cookiePath, "utf8"));
      if (data && typeof data.cookie === "string") return data.cookie;
    }
  } catch (err) {
    logger.error("❌ Failed to load cookie:", err.message);
  }
  return null;
}

function loadCredentials() {
  try {
    if (!fs.existsSync(credsFilePath)) return null;
    const raw = fs.readFileSync(credsFilePath, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && parsed.expiry_date) {
      const n = Number(parsed.expiry_date);
      if (!Number.isNaN(n)) parsed.expiry_date = n;
    }
    return parsed;
  } catch (err) {
    logger.error("❌ Failed to load credentials:", err.message);
    return null;
  }
}

async function getInnertube(forceNew = false) {
  if (!innertube || forceNew) {
    try {
      const savedCookie = loadCookie();
      const savedCreds = loadCredentials();

      const createOpts = {
        cache: new UniversalCache(cacheDir),
        clientType: ClientType.WEB,
      };

      if (savedCookie) {
        logger.info("🍪 Restoring from saved cookie during create");
        createOpts.cookie = savedCookie;
      }

      if (savedCreds) {
        logger.info("🔐 Supplying saved credentials to Innertube.create");
        createOpts.credentials = savedCreds;
      }

      innertube = await Innertube.create(createOpts);

      // IMPORTANT: Do NOT call signIn() here.
      // Authentication is triggered explicitly by auth.authenticate().
      // If credentials are valid, the session is already authenticated.

      logger.info("✅ Innertube instance created");
    } catch (err) {
      logger.error("❌ Failed to create Innertube instance:", err.message);
      innertube = null;
      throw err;
    }
  }
  return innertube;
}

function resetInnertube() {
  innertube = null;
  logger.info("🔄 Innertube instance reset");
}

function clearCredentials() {
  try {
    if (fs.existsSync(credsFilePath)) fs.unlinkSync(credsFilePath);
    logger.info("🗑️ Credentials cleared");
  } catch (err) {
    logger.error("❌ Error clearing credentials:", err.message);
  }
}

function clearCookie() {
  try {
    if (fs.existsSync(cookiePath)) fs.unlinkSync(cookiePath);
    logger.info("🗑️ Cookie cleared");
  } catch (err) {
    logger.error("❌ Error clearing cookie:", err.message);
  }
}

// Internal use only – NOT exported via index.js
module.exports = {
  getInnertube,
  saveCredentials,
  loadCredentials,
  resetInnertube,
  clearCredentials,
  saveCookie,
  loadCookie,
  clearCookie,
};