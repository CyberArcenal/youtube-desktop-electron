// src/renderer/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/home/HomePage';
import WatchPage from './pages/watch/WatchPage';

// Placeholder pages (gagawa pa lang)
const SearchPage = () => <div className="p-4">Search Results</div>;
const SubscriptionsPage = () => <div className="p-4">Subscriptions</div>;
const LibraryPage = () => <div className="p-4">Library</div>;
const SettingsPage = () => <div className="p-4">Settings</div>;

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;