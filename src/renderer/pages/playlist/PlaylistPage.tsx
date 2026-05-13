// src/renderer/pages/playlist/PlaylistPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ListVideo } from 'lucide-react';
import VideoGrid from '../../components/Shared/VideoGrid';
import type { VideoItem } from '../../services/types';
import { getPlaylistVideos } from '../../services/playlist';

const PlaylistPage: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [playlistTitle, setPlaylistTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playlistId) return;

    const loadPlaylist = async () => {
      setLoading(true);
      setError(null);
      try {
        const playlistVideos = await getPlaylistVideos(playlistId);
        setVideos(playlistVideos);
        // If API returns playlist title, set it; otherwise fallback
        if (playlistVideos.length > 0 && (playlistVideos[0] as any).playlistTitle) {
          setPlaylistTitle((playlistVideos[0] as any).playlistTitle);
        } else {
          setPlaylistTitle('Playlist');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [playlistId]);

  const handlePlayAll = () => {
    if (videos.length > 0) {
      navigate(`/watch/${videos[0].id}`);
    }
  };

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

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-[#1f1f1f] rounded-full p-4 mb-4">
          <ListVideo size={40} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Empty playlist</h2>
        <p className="text-gray-400">This playlist has no videos</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Playlist header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 p-4 bg-[#1a1a1a] rounded-xl">
        <div className="w-full md:w-48 flex-shrink-0">
          <div className="relative">
            <img
              src={videos[0]?.thumbnail || 'https://via.placeholder.com/320x180?text=Playlist'}
              alt={playlistTitle}
              className="w-full aspect-video object-cover rounded-xl shadow-lg"
            />
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition">
              <button
                onClick={handlePlayAll}
                className="bg-red-600 hover:bg-red-700 rounded-full p-3 text-white transition-transform hover:scale-110"
              >
                <Play size={24} fill="white" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-2 line-clamp-2">{playlistTitle}</h1>
          <p className="text-gray-400 text-sm mb-4">{videos.length} videos</p>
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white text-sm font-medium transition"
          >
            <Play size={16} fill="white" />
            Play all
          </button>
        </div>
      </div>

      {/* Video list */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Videos</h2>
        <VideoGrid videos={videos} />
      </div>
    </div>
  );
};

export default PlaylistPage;