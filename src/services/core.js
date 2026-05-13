//@ts-check
const { Innertube, UniversalCache, ClientType } = require("youtubei.js");
const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const { logger } = require("../utils/logger");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

const baseDataPath = isDev
  ? path.join(process.cwd(), "data")
  : app.getPath("userData");

const cacheDir = path.join(baseDataPath, "youtube-cache");
const cookiePath = path.join(baseDataPath, "youtube-cookie.json");

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

/**
 * @type {Innertube | null}
 */
let innertube = null;

/**
 * @param {fs.PathLike} filePath
 * @param {string | NodeJS.ArrayBufferView<ArrayBufferLike>} data
 */
function atomicWriteFileSync(filePath, data) {
  // @ts-ignore
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.tmp-${process.pid}-${Date.now()}`);
  fs.writeFileSync(tmp, data, { encoding: "utf8", mode: 0o600 });
  fs.renameSync(tmp, filePath);
}

/**
 * @param {string} cookieString
 */
function saveCookie(cookieString) {
  try {
    if (!cookieString?.trim()) return;
    atomicWriteFileSync(
      cookiePath,
      JSON.stringify({ cookie: cookieString.trim() }, null, 2),
    );
    logger.info("✅ Cookie saved successfully");
    return true;
  } catch (err) {
    // @ts-ignore
    logger.error("❌ Failed to save cookie:", err.message);
    return false;
  }
}

function loadCookie() {
  try {
    if (!fs.existsSync(cookiePath)) return null;
    const data = JSON.parse(fs.readFileSync(cookiePath, "utf8"));
    return data.cookie || null;
  } catch (err) {
    // @ts-ignore
    logger.error("❌ Failed to load cookie:", err.message);
    return null;
  }
}

function clearCookie() {
  try {
    if (fs.existsSync(cookiePath)) fs.unlinkSync(cookiePath);
    innertube = null;
    logger.info("🗑️ Cookie cleared");
  } catch (e) {}
}
function resetInnertube() {
  innertube = null;
  logger.info("🔄 Innertube instance reset");
}

// Idagdag ito sa core.js

/**
 * Check if the current Innertube cookie is still valid
 * Returns true if account info is available, false otherwise
 */
async function isCookieValid() {
  try {
    if (!innertube) return false;
    const account = await innertube.account.getInfo().catch(() => null);
    // @ts-ignore
    return account?.name ? true : false;
  } catch {
    return false;
  }
}

/**
 * Refresh cookie from current session (using the auth module's function)
 * This avoids circular dependency; you can pass a callback or use event
 * @param {() => any} sessionCookieExtractor
 */
async function refreshCookieFromSession(sessionCookieExtractor) {
  if (typeof sessionCookieExtractor === "function") {
    const newCookie = await sessionCookieExtractor();
    if (newCookie) {
      saveCookie(newCookie);
      resetInnertube();
      return true;
    }
  }
  return false;
}

// Modified getInnertube with auto-refresh logic
async function getInnertube(forceNew = false) {
  if (innertube && !forceNew) return innertube;

  const savedCookie = loadCookie();

  const headers = {
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/'
  };

  if (savedCookie) {
    headers['Cookie'] = savedCookie;
  }

  innertube = await Innertube.create({
    cache: new UniversalCache(cacheDir),
    clientType: ClientType.WEB,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    fetchOptions: {
      headers: headers
    }
  });

  logger.info("✅ Innertube created with Cookie");

  try {
    const account = await innertube.account.getInfo();
    logger.info(`✅ Logged in as: ${account.name}`);
  } catch (e) {
    logger.warn("Account info failed (still 401 possible)");
  }

  return innertube;
}

// Optional: Set up a periodic validator (every 30 minutes)
/**
 * @type {string | number | NodeJS.Timeout | null | undefined}
 */
let validityInterval = null;
function startCookieValidityChecker(checkIntervalMs = 30 * 60 * 1000) {
  if (validityInterval) clearInterval(validityInterval);
  validityInterval = setInterval(async () => {
    if (innertube) {
      const valid = await isCookieValid();
      if (!valid) {
        logger.warn("Cookie validation failed, need refresh");
        const { app } = require("electron");
        app.emit("youtube:need-cookie-refresh");
      }
    }
  }, checkIntervalMs);
}

function stopCookieValidityChecker() {
  if (validityInterval) {
    clearInterval(validityInterval);
    validityInterval = null;
  }
}

module.exports = {
  getInnertube,
  saveCookie,
  loadCookie,
  clearCookie,
  resetInnertube,
  stopCookieValidityChecker,
  startCookieValidityChecker,
  refreshCookieFromSession,
};
