// src/main/ipc/handlers/fileHandler.js
// Cleaned version for YouTube Desktop App – removed logger dependency

const { ipcMain, shell, clipboard } = require("electron");
const fs = require("fs");
const path = require("path");

class FileHandler {
  constructor() {
    this._registerHandlers();
  }

  _registerHandlers() {
    ipcMain.handle("openFile", async (event, filePath) => {
      return await this.openFile(filePath);
    });

    ipcMain.handle("showItemInFolder", async (event, filePath) => {
      return await this.showItemInFolder(filePath);
    });

    ipcMain.handle("getFileInfo", async (event, filePath) => {
      return await this.getFileInfo(filePath);
    });

    ipcMain.handle("fileExists", async (event, filePath) => {
      return await this.fileExists(filePath);
    });

    ipcMain.handle("openDirectory", async (event, dirPath) => {
      return await this.openDirectory(dirPath);
    });
  }

  async openFile(filePath) {
    try {
      if (!filePath || typeof filePath !== "string") throw new Error("Invalid file path");
      if (!(await this.fileExists(filePath))) throw new Error(`File not found: ${filePath}`);
      await shell.openPath(filePath);
      return { status: true, message: `Opened: ${path.basename(filePath)}`, data: { filePath } };
    } catch (error) {
      console.error("openFile error:", error);
      return { status: false, message: error.message, data: null };
    }
  }

  async showItemInFolder(filePath) {
    try {
      if (!filePath || typeof filePath !== "string") throw new Error("Invalid file path");
      if (!(await this.fileExists(filePath))) throw new Error(`File not found: ${filePath}`);
      shell.showItemInFolder(filePath);
      return { status: true, message: `Shown in folder: ${path.basename(filePath)}`, data: { filePath } };
    } catch (error) {
      console.error("showItemInFolder error:", error);
      return { status: false, message: error.message, data: null };
    }
  }

  async openDirectory(dirPath) {
    try {
      if (!dirPath || typeof dirPath !== "string") throw new Error("Invalid directory path");
      if (!(await this.directoryExists(dirPath))) throw new Error(`Directory not found: ${dirPath}`);
      await shell.openPath(dirPath);
      return { status: true, message: `Opened directory: ${path.basename(dirPath)}`, data: { dirPath } };
    } catch (error) {
      console.error("openDirectory error:", error);
      return { status: false, message: error.message, data: null };
    }
  }

  async getFileInfo(filePath) {
    try {
      if (!filePath || typeof filePath !== "string") throw new Error("Invalid file path");
      if (!(await this.fileExists(filePath))) throw new Error(`File not found: ${filePath}`);
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      return {
        status: true,
        message: "File info retrieved",
        data: {
          filename: path.basename(filePath),
          filePath,
          fileSize: this._formatFileSize(stats.size),
          created: stats.birthtime,
          modified: stats.mtime,
          extension: ext,
        },
      };
    } catch (error) {
      console.error("getFileInfo error:", error);
      return { status: false, message: error.message, data: null };
    }
  }

  async fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  async directoryExists(dirPath) {
    try {
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  }

  _formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Auto‑register when required
const fileHandler = new FileHandler();
module.exports = { FileHandler, fileHandler };