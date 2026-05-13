// src/renderer/pages/downloads/DownloadsPage.tsx
import React, { useEffect, useState } from 'react';
import { Download, FolderOpen, Play, Trash2, FileText, ChevronRight } from 'lucide-react';

interface DownloadItem {
  name: string;
  path: string;
  size: number;
  modifiedAt: Date;
}

const DownloadsPage: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadDir, setDownloadDir] = useState<string>('');

  // Load saved download directory from localStorage, or use default
  useEffect(() => {
    const savedDir = localStorage.getItem('download_directory');
    if (savedDir) {
      setDownloadDir(savedDir);
    } else {
      // Get default Downloads folder path via backend if available
      window.backendAPI.getAppInfo().then(info => {
        const defaultPath = `${info.userDataPath}/Downloads`;
        setDownloadDir(defaultPath);
        localStorage.setItem('download_directory', defaultPath);
      }).catch(console.error);
    }
  }, []);

  const loadDownloads = async () => {
    if (!downloadDir) return;
    setLoading(true);
    setError(null);
    try {
      // Use getFilesInDirectory to list video files (mp4, webm, etc.)
      const result = await window.backendAPI.getFilesInDirectory(downloadDir, ['.mp4', '.webm', '.mkv', '.avi', '.mov']);
      if (result.status && result.data) {
        const items: DownloadItem[] = result.data.map((file: any) => ({
          name: file.name,
          path: file.path,
          size: file.size,
          modifiedAt: new Date(file.modifiedAt),
        }));
        // Sort by modified date descending (newest first)
        items.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
        setDownloads(items);
      } else {
        setError(result.message || 'Failed to load downloads');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (downloadDir) loadDownloads();
  }, [downloadDir]);

  const handleOpenFile = async (filePath: string) => {
    const result = await window.backendAPI.openFile(filePath);
    if (!result.status) alert(result.message);
  };

  const handleShowInFolder = async (filePath: string) => {
    const result = await window.backendAPI.showItemInFolder(filePath);
    if (!result.status) alert(result.message);
  };

  const handleDeleteFile = async (filePath: string, fileName: string) => {
    if (confirm(`Delete "${fileName}"? This action cannot be undone.`)) {
      const result = await window.backendAPI.deleteFile(filePath);
      if (result.status) {
        setDownloads(prev => prev.filter(d => d.path !== filePath));
      } else {
        alert(result.message);
      }
    }
  };

  const handleClearAll = async () => {
    if (downloads.length === 0) return;
    if (confirm(`Delete all ${downloads.length} downloaded videos? This cannot be undone.`)) {
      let successCount = 0;
      for (const item of downloads) {
        const result = await window.backendAPI.deleteFile(item.path);
        if (result.status) successCount++;
      }
      if (successCount === downloads.length) {
        setDownloads([]);
      } else {
        alert(`Deleted ${successCount} out of ${downloads.length} files. Some files could not be deleted.`);
        loadDownloads(); // refresh
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const chooseDownloadFolder = async () => {
    // Use the existing openDirectory dialog; assume backendAPI.openDirectory returns chosen path
    const result = await window.backendAPI.openDirectory('');
    if (result.status && result.data) {
      const newPath = result.data.path;
      setDownloadDir(newPath);
      localStorage.setItem('download_directory', newPath);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Download size={28} />
          <h1 className="text-2xl font-bold">Downloads</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={chooseDownloadFolder}
            className="flex items-center gap-2 px-4 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-sm transition"
          >
            <FolderOpen size={16} />
            Change folder
          </button>
          {downloads.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-full text-sm transition text-red-400"
            >
              <Trash2 size={16} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Current download directory info */}
      <div className="mb-4 text-sm text-gray-400 bg-[#1a1a1a] rounded-lg p-3">
        <span className="font-medium">Download folder:</span> {downloadDir}
      </div>

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-2">{error}</p>
          <button onClick={loadDownloads} className="px-4 py-2 bg-[#272727] rounded-full text-sm">Retry</button>
        </div>
      )}

      {!error && downloads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Download size={48} className="text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No downloads found</h2>
          <p className="text-gray-400">Videos you download from YouTube will appear here.</p>
          <button onClick={chooseDownloadFolder} className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full text-sm">
            Set download folder
          </button>
        </div>
      )}

      {downloads.length > 0 && (
        <div className="space-y-2">
          {downloads.map((item) => (
            <div
              key={item.path}
              className="bg-[#1a1a1a] rounded-xl p-3 flex flex-wrap items-center gap-3 hover:bg-[#222] transition group"
            >
              {/* Thumbnail placeholder (optional) */}
              <div className="w-16 h-12 bg-[#2a2a2a] rounded flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{item.name}</p>
                <div className="flex flex-wrap gap-x-4 text-xs text-gray-400 mt-1">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{item.modifiedAt.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenFile(item.path)}
                  className="p-2 rounded-full hover:bg-[#333] text-green-500 transition"
                  title="Play"
                >
                  <Play size={18} />
                </button>
                <button
                  onClick={() => handleShowInFolder(item.path)}
                  className="p-2 rounded-full hover:bg-[#333] text-blue-400 transition"
                  title="Show in folder"
                >
                  <FolderOpen size={18} />
                </button>
                <button
                  onClick={() => handleDeleteFile(item.path, item.name)}
                  className="p-2 rounded-full hover:bg-[#333] text-red-400 transition"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadsPage;