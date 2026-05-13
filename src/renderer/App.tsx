// src/renderer/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/home/HomePage';
import WatchPage from './pages/watch/WatchPage';
import SearchPage from './pages/search/SearchPage';
import SubscriptionsPage from './pages/subscriptions/SubscriptionsPage';
import LibraryPage from './pages/library/LibraryPage';
import SettingsPage from './pages/settings/SettingsPage';
import LikedPage from './pages/liked/LikedPage';
import ChannelPage from './pages/channel/ChannelPage';
import PlaylistPage from './pages/playlist/PlaylistPage';
import HistoryPage from './pages/history/HistoryPage';
import WatchLaterPage from './pages/watch-later/WatchLaterPage';
import DownloadsPage from './pages/downloads/DownloadsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="watch/:videoId" element={<WatchPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="liked" element={<LikedPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="watch-later" element={<WatchLaterPage />} />
          <Route path="downloads" element={<DownloadsPage />} />
          <Route path="channel/:channelId" element={<ChannelPage />} />
          <Route path="playlist/:playlistId" element={<PlaylistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;