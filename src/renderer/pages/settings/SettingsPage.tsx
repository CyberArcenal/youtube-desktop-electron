// src/renderer/pages/settings/SettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { Sun, Moon, LogOut, RefreshCw, Trash2, User, Info } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { authenticate, isLoggedIn } from '../../services/auth';
import type { AppInfo } from '../../types/global';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState({ auth: false, clear: false, signOut: false });

  useEffect(() => {
    // Load app info
    window.backendAPI.getAppInfo().then(setAppInfo).catch(console.error);
    // Check auth status
    isLoggedIn()
      .then(setLoggedIn)
      .catch(console.error)
      .finally(() => setIsAuthChecked(true));
  }, []);

  const handleSignOut = async () => {
    setLoading(prev => ({ ...prev, signOut: true }));
    try {
      // Call backend signOut if available, otherwise clear local credentials
      if (window.backendAPI.signOut) {
        await window.backendAPI.signOut();
      } else {
        // Fallback: clear any stored tokens (implement as needed)
        localStorage.removeItem('youtube_credentials');
        // Also clear cookies if possible
        document.cookie.split(';').forEach(c => {
          document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
      }
      setLoggedIn(false);
      alert('Signed out successfully. Please restart the app to fully clear session.');
    } catch (err) {
      console.error('Sign out error', err);
      alert('Failed to sign out');
    } finally {
      setLoading(prev => ({ ...prev, signOut: false }));
    }
  };

  const handleClearCache = async () => {
    setLoading(prev => ({ ...prev, clear: true }));
    try {
      // Clear cookies and localStorage credentials
      document.cookie.split(';').forEach(c => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      localStorage.removeItem('youtube_credentials');
      // Optionally clear other app data
      alert('Cache and credentials cleared. Restart the app for full effect.');
      setLoggedIn(false);
    } catch (err) {
      console.error('Clear cache error', err);
      alert('Failed to clear cache');
    } finally {
      setLoading(prev => ({ ...prev, clear: false }));
    }
  };

  const handleReauth = async () => {
    setLoading(prev => ({ ...prev, auth: true }));
    try {
      await authenticate();
      // After authentication, re-check status
      const newStatus = await isLoggedIn();
      setLoggedIn(newStatus);
    } catch (err) {
      console.error('Re-authentication error', err);
      alert('Authentication failed');
    } finally {
      setLoading(prev => ({ ...prev, auth: false }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-5">
        {/* Appearance */}
        <div className="bg-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full transition"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="bg-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <User size={18} />
            Account
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">YouTube sign-in</span>
              <span className={`text-sm px-2 py-1 rounded-full ${loggedIn ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                {isAuthChecked ? (loggedIn ? 'Signed in' : 'Not signed in') : 'Checking...'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleReauth}
                disabled={loading.auth}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading.auth ? 'animate-spin' : ''} />
                Re-authenticate
              </button>
              <button
                onClick={handleSignOut}
                disabled={loading.signOut || !loggedIn}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-full text-sm transition disabled:opacity-50 text-red-400"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Trash2 size={18} />
            Storage
          </h2>
          <button
            onClick={handleClearCache}
            disabled={loading.clear}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-sm transition disabled:opacity-50"
          >
            <Trash2 size={14} />
            Clear cache & credentials
          </button>
          <p className="text-gray-400 text-xs mt-2">This will clear all saved YouTube session data and local cache.</p>
        </div>

        {/* About */}
        <div className="bg-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Info size={18} />
            About
          </h2>
          <div className="space-y-1 text-sm text-gray-300">
            <p><span className="text-gray-400">Version:</span> {appInfo?.version || 'unknown'}</p>
            <p><span className="text-gray-400">Platform:</span> {appInfo?.platform || 'unknown'}</p>
            <p><span className="text-gray-400">Data path:</span> {appInfo?.userDataPath || 'unknown'}</p>
            <p><span className="text-gray-400">Environment:</span> {appInfo?.isDev ? 'Development' : 'Production'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;