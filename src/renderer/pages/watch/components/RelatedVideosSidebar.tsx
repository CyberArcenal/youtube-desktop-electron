// src/renderer/pages/watch/components/RelatedVideosSidebar.tsx
import React from "react";
import VideoCard from "../../../components/Shared/VideoCard";
import type { VideoItem } from "../../../services/types";

interface RelatedVideosSidebarProps {
  videos: VideoItem[];
}

export const RelatedVideosSidebar: React.FC<RelatedVideosSidebarProps> = ({ videos }) => {
  return (
    <div>
      <h3 className="text-white font-medium mb-3 sticky top-0 bg-[#0f0f0f] py-2 z-10">
        Recommended videos
      </h3>
      <div className="space-y-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};