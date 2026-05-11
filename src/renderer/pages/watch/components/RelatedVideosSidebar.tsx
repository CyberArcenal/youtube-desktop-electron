// src/renderer/pages/watch/components/RelatedVideosSidebar.tsx
import React from "react";
import VideoCard from "../../../components/Shared/VideoCard";
import type { VideoItem } from "../../../services/youtube";

interface RelatedVideosSidebarProps {
  videos: VideoItem[];
}

export const RelatedVideosSidebar: React.FC<RelatedVideosSidebarProps> = ({ videos }) => {
  return (
    <div className="lg:w-96">
      <h3 className="text-white font-medium mb-3">Recommended videos</h3>
      <div className="space-y-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};