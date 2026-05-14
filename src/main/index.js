// src/main/index.js
// YouTube Desktop App – Modular YouTube Service
//@ts-check
const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  dialog,
  shell,
  session,
} = require("electron");
const path = require("path");
const fs = require("fs");
const url = require("url");
const { registerAuthHandlers } = require("./ipc/core/auth.ipc.js");
const { registerFeedHandlers } = require("./ipc/core/feed.ipc.js");
const { registerPlayerHandlers } = require("./ipc/core/player.ipc.js");
const { registerChannelHandlers } = require("./ipc/core/channel.ipc.js");
const { registerCommentsHandlers } = require("./ipc/core/comments.ipc.js");
const {
  registerInteractionsHandlers,
} = require("./ipc/core/interactions.ipc.js");
const { registerPlaylistHandlers } = require("./ipc/core/playlist.ipc.js");
const { registerSearchHandlers } = require("./ipc/core/search.ipc.js");
const { registerHistoryHandlers } = require("./ipc/core/history.ipc.js");
const {
  registerNotificationHandlers,
} = require("./ipc/core/notifications.ipc.js");
const { registerRelatedHandlers } = require("./ipc/core/related.ipc.js");
const { registerWatchLaterHandlers } = require("./ipc/core/watchlater.ipc.js");
const { getInnertube } = require("../services/core.js");
const { logger } = require("../utils/logger.js");
const core = require("../services/index");
const auth = require("../services/auth.js");
// ===================== CONFIGURATION =====================
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const appName = "YouTube Desktop";
const userDataPath = app.getPath("userData");
const version = app.getVersion();

/**
 * @type {{ session: { credentials: any; }; } | null}
 */
let innertubeInstance = null;

// ===================== LOGGING =====================
// @ts-ignore
// @ts-ignore
// @ts-ignore
const LogLevel = {
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARN: "WARN",
  ERROR: "ERROR",
};
// @ts-ignore
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] [${appName} ${level}] ${message}`;
  if (isDev) {
    const colors = {
      INFO: "\x1b[34m",
      SUCCESS: "\x1b[32m",
      WARN: "\x1b[33m",
      ERROR: "\x1b[31m",
    };
    // @ts-ignore
    console.log(`${colors[level] || ""}${logMsg}\x1b[0m`);
  } else {
    console.log(logMsg);
  }
  if (data) console.dir(data, { depth: 2 });
}

// ===================== GLOBAL STATE =====================
// @ts-ignore
let mainWindow = null;
// @ts-ignore
let splashWindow = null;
let isShuttingDown = false;

// ===================== BASIC IPC HANDLERS =====================
function registerBasicIpcHandlers() {
  // Window Controls
  // @ts-ignore
  ipcMain.on("window:minimize", () => mainWindow?.minimize());
  ipcMain.on("window:maximize", () =>
    // @ts-ignore
    mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(),
  );
  // @ts-ignore
  ipcMain.on("window:close", () => mainWindow?.close());
  // @ts-ignore
  ipcMain.on("window:reload", () => mainWindow?.reload());
  ipcMain.on("window:toggle-devtools", () =>
    // @ts-ignore
    mainWindow?.webContents.toggleDevTools(),
  );

  // @ts-ignore
  // @ts-ignore
  ipcMain.on("app:open-external", (event, url) => {
    if (url?.startsWith("http")) shell.openExternal(url);
  });

  ipcMain.handle("app:get-info", () => ({
    name: appName,
    version,
    isDev,
    platform: process.platform,
    userDataPath,
  }));

  registerAuthHandlers();
  registerFeedHandlers();
  registerPlayerHandlers();
  registerCommentsHandlers();
  registerChannelHandlers();
  registerPlaylistHandlers();
  registerInteractionsHandlers();
  registerSearchHandlers();
  registerRelatedHandlers();
  registerHistoryHandlers();
  registerWatchLaterHandlers();
  registerNotificationHandlers();
}

/**
 * Get icon path based on platform and environment
 */
function getIconPath() {
  const platform = process.platform;
  const iconDir = isDev
    ? path.resolve(__dirname, "..", "..", "build")
    : path.join(process.resourcesPath, "build");

  const iconMap = {
    win32: "icon.ico",
    darwin: "icon.icns",
    linux: "icon.png",
  };

  // @ts-ignore
  const iconFile = iconMap[platform] || "icon.png";
  const iconPath = path.join(iconDir, iconFile);

  return fs.existsSync(iconPath) ? iconPath : null;
}

// ===================== SPLASH WINDOW =====================
async function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 360,
    transparent: false,
    frame: false,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    show: false,
    backgroundColor: "#0f0f0f",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const splashPath = path.join(__dirname, "splash.html");
  if (fs.existsSync(splashPath)) {
    await splashWindow.loadFile(splashPath);
  } else {
    await splashWindow.loadURL("about:blank");
  }
  splashWindow.show();
  log("INFO", "Splash window created");
  return splashWindow;
}

// ===================== GET APP URL =====================
async function getAppUrl() {
  if (isDev) {
    const devUrl = "http://localhost:3000";
    log("INFO", `Dev mode: ${devUrl}`);
    return devUrl;
  }
  const possiblePaths = [
    path.join(__dirname, "..", "renderer", "index.html"),
    path.join(__dirname, "..", "..", "dist", "renderer", "index.html"),
    path.join(
      process.resourcesPath,
      "app.asar",
      "dist",
      "renderer",
      "index.html",
    ),
    path.join(app.getAppPath(), "dist", "renderer", "index.html"),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return url.pathToFileURL(p).href;
  }
  throw new Error("Production build not found. Run `npm run build` first.");
}

// ===================== CREATE MAIN WINDOW =====================
async function createMainWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;
  const winWidth = Math.min(1280, screenWidth - 100);
  const winHeight = Math.min(800, screenHeight - 100);

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    frame: true,
    backgroundColor: "#0f0f0f",
    // @ts-ignore
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: !isDev,
      sandbox: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.setTitle(appName);

  const appUrl = await getAppUrl();
  await mainWindow.loadURL(appUrl);

  mainWindow.once("ready-to-show", () => {
    // @ts-ignore
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    // @ts-ignore
    mainWindow.show();
    // @ts-ignore
    mainWindow.focus();
    log("SUCCESS", "Main window ready");

    // @ts-ignore
    mainWindow.webContents.send("app:ready", {
      version,
      isDev,
      platform: process.platform,
    });
  });

  // Window state events
  ["maximize", "unmaximize", "minimize", "restore"].forEach((event) => {
    // @ts-ignore
    mainWindow.on(event, () => {
      // @ts-ignore
      mainWindow.webContents.send("window-state-changed", event);
    });
  });

  mainWindow.on("close", (event) => {
    if (!isShuttingDown) {
      event.preventDefault();
      // @ts-ignore
      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: "question",
        buttons: ["Yes", "No"],
        title: "Confirm Exit",
        message: "Are you sure you want to quit?",
      });
      if (choice === 0) {
        isShuttingDown = true;
        // @ts-ignore
        mainWindow.destroy();
      }
    }
  });

  if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });
  return mainWindow;
}

// ===================== LOAD EXTERNAL MODULES =====================
function loadExternalModules() {
  try {
    require("./ipc/utils/handlers/fileHandler.js");
    log("INFO", "File handler loaded");
  } catch (error) {
    // @ts-ignore
    log("WARN", "File handler not loaded:", error.message);
  }

  require("./ipc/windows_control.ipc.js");

  try {
    const updaterModule = require("./ipc/utils/updater/index.ipc.js");
    if (typeof updaterModule.setMainWindow === "function") {
      // @ts-ignore
      updaterModule.setMainWindow(mainWindow);
      log("INFO", "Updater handler attached");
    }
  } catch (error) {
    // @ts-ignore
    log("WARN", "Updater not loaded:", error.message);
  }
}

async function addHeadersInterceptor() {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.includes("googlevideo.com")) {
      details.requestHeaders["Origin"] = "https://www.youtube.com";
      details.requestHeaders["Referer"] = "https://www.youtube.com";
      details.requestHeaders["User-Agent"] =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/134.0.0.0 Safari/537.36";
    }
    callback({ requestHeaders: details.requestHeaders });
  });
}
async function setupInnertubeSession() {
  // @ts-ignore
  innertubeInstance = await getInnertube();
  // @ts-ignore
  innertubeInstance.session.on("auth-refresh", () => {
    // @ts-ignore
    saveCredentials(innertubeInstance.session.credentials);
  });
}
// ===================== STARTUP SEQUENCE =====================
async function startupSequence() {
  try {
    log("INFO", `Starting ${appName} v${version}...`);
    log("INFO", `Environment: ${isDev ? "Development" : "Production"}`);

    registerBasicIpcHandlers();
    await addHeadersInterceptor();

    await createSplashWindow();
    await createMainWindow();
    loadExternalModules();
    await setupInnertubeSession();

    log("SUCCESS", "✅ Application started successfully");
  } catch (error) {
    // @ts-ignore
    log("ERROR", "Startup failed:", error.message);
    // @ts-ignore
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    // @ts-ignore
    dialog.showErrorBox("Startup Error", error.message);
    app.quit();
  }
}

// ===================== APP EVENTS =====================
app.whenReady().then(startupSequence);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) startupSequence();
});
app.on("before-quit", () => {
  isShuttingDown = true;
});
