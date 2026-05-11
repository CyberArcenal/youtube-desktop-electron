// src/renderer/components/Shared/VideoGrid.tsx
import React from 'react';
import VideoCard from './VideoCard';
import type { VideoItem } from '../../services/youtube';

interface VideoGridProps {
  videos: VideoItem[];
  title?: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, title }) => {
  if (videos.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-400">No videos found</p>
      </div>
    );
  }

  return (
    <div>
      {title && <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;