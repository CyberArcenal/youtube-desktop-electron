// src/renderer/pages/library/LibraryPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthGuard from '../../components/Auth/AuthGuard';
import type { PlaylistInfo } from '../../services/types';
import { getUserPlaylists } from '../../services/playlist';

const LibraryPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<PlaylistInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlaylists = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getUserPlaylists();
        setPlaylists(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load playlists');
      } finally {
        setLoading(false);
      }
    };
    loadPlaylists();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-sm text-white transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-[#1f1f1f] rounded-full p-4 mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No playlists found</h2>
        <p className="text-gray-400">Your saved YouTube playlists will appear here</p>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Your playlists</h1>
          <p className="text-gray-400 text-sm mt-1">{playlists.length} playlists</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              to={`/playlist/${playlist.id}`}
              className="group cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="relative">
                <img
                  src={playlist.thumbnail || 'https://via.placeholder.com/320x180?text=Playlist'}
                  alt={playlist.title}
                  className="w-full aspect-video object-cover rounded-xl"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
                  }}
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {playlist.videoCount} {playlist.videoCount === 1 ? 'video' : 'videos'}
                </div>
              </div>
              <h3 className="font-semibold text-white line-clamp-2 text-sm mt-2 group-hover:text-red-500 transition">
                {playlist.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
};

export default LibraryPage;