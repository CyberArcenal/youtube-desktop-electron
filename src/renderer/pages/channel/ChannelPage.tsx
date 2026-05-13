// src/renderer/pages/channel/ChannelPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SubscribeButton } from './components/SubscribeButton';
import VideoGrid from '../../components/Shared/VideoGrid';
import { getChannelInfo, getChannelVideos, getChannelPlaylists } from '../../services/channel';
import { unsubscribe, subscribe } from '../../services/interactions';
import type { ChannelInfo, VideoItem, PlaylistInfo } from '../../services/types';


type TabType = 'videos' | 'playlists';

const ChannelPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load channel info and initial data
  useEffect(() => {
    if (!channelId) return;

    const loadChannelData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [info, channelVideos, channelPlaylists] = await Promise.all([
          getChannelInfo(channelId),
          getChannelVideos(channelId),
          getChannelPlaylists(channelId),
        ]);
        setChannel(info);
        setVideos(channelVideos);
        setPlaylists(channelPlaylists);
        // Note: subscribe status detection would ideally come from the API.
        // For now, we derive from the UI state or you can add a separate endpoint.
        // We'll set a placeholder – you can later implement a "isSubscribedToChannel" call.
        setIsSubscribed(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load channel');
      } finally {
        setLoading(false);
      }
    };

    loadChannelData();
  }, [channelId]);

  const handleSubscribe = async () => {
    if (!channelId) return;
    setSubscribing(true);
    try {
      if (isSubscribed) {
        await unsubscribe(channelId);
        setIsSubscribed(false);
      } else {
        await subscribe(channelId);
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error('Subscribe error:', err);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-2">{error || 'Channel not found'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-sm text-white transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Banner */}
      <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-red-900/30 to-black">
        {channel.banner ? (
          <img src={channel.banner} alt="Channel banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#1f1f1f] flex items-center justify-center">
            <span className="text-gray-500 text-sm">No banner</span>
          </div>
        )}
      </div>

      {/* Channel header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mt-6 px-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-[#272727] border-4 border-[#0f0f0f] shadow-lg">
            {channel.avatar ? (
              <img src={channel.avatar} alt={channel.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                {channel.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{channel.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{channel.subscriberCount} subscribers</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <SubscribeButton
            isSubscribed={isSubscribed}
            onClick={handleSubscribe}
            disabled={subscribing}
          />
        </div>
      </div>

      {/* Description */}
      {channel.description && (
        <div className="mt-4 px-4">
          <p className="text-gray-300 text-sm line-clamp-3">{channel.description}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#272727] mt-6 px-4">
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 text-sm font-medium transition ${
            activeTab === 'videos'
              ? 'text-white border-b-2 border-red-600'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Videos ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`pb-3 text-sm font-medium transition ${
            activeTab === 'playlists'
              ? 'text-white border-b-2 border-red-600'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Playlists ({playlists.length})
        </button>
      </div>

      {/* Content */}
      <div className="mt-6 px-4">
        {activeTab === 'videos' && (
          <>
            {videos.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No videos uploaded yet</div>
            ) : (
              <VideoGrid videos={videos} />
            )}
          </>
        )}

        {activeTab === 'playlists' && (
          <>
            {playlists.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No public playlists</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => {/* navigate to playlist view */}}
                    className="cursor-pointer group"
                  >
                    <div className="relative">
                      <img
                        src={playlist.thumbnail || 'https://via.placeholder.com/320x180?text=Playlist'}
                        alt={playlist.title}
                        className="w-full aspect-video object-cover rounded-xl"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {playlist.videoCount} videos
                      </div>
                    </div>
                    <h3 className="text-white font-medium mt-2 line-clamp-1 group-hover:text-red-500 transition">
                      {playlist.title}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;