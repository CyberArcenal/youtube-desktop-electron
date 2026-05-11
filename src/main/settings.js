const Store = require('electron-store');

const schema = {
  theme: { type: 'string', enum: ['light', 'dark', 'system'], default: 'dark' },
  autoPlay: { type: 'boolean', default: false },
  defaultQuality: { type: 'string', enum: ['auto', '1080p', '720p', '480p'], default: 'auto' },
  downloadFolder: { type: 'string', default: app.getPath('downloads') },
  notificationsEnabled: { type: 'boolean', default: true },
  pipEnabled: { type: 'boolean', default: true },
  cacheLimitMB: { type: 'number', minimum: 100, maximum: 5000, default: 500 },
};

const settingsStore = new Store({ schema, name: 'user-settings' });

function getSetting(key) { return settingsStore.get(key); }
function setSetting(key, value) { settingsStore.set(key, value); }
function getAllSettings() { return settingsStore.store; }
function resetSettings() { settingsStore.clear(); }

module.exports = { getSetting, setSetting, getAllSettings, resetSettings };