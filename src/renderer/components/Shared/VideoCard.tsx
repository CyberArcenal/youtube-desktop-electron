import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import type { VideoItem } from '../../services/youtube';

interface VideoCardProps {
  video: VideoItem;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/watch/${video.id}`);
  };
// console.log(video)
  return (
    <div
      onClick={handleClick}
      className="cursor-pointer group rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover rounded-xl"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
          }}
        />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </span>
      </div>
      <div className="mt-2 px-1">
        <h3 className="font-semibold text-white line-clamp-2 text-sm group-hover:text-red-500 transition">
          {typeof video.title === 'string' ? video.title : ''}
        </h3>
        <p className="text-gray-400 text-xs mt-1">{typeof video.channelName === 'string' ? video.channelName : ''}</p>
        <div className="flex items-center gap-3 text-gray-400 text-xs mt-1">
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{video.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{video.publishedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;