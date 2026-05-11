// src/renderer/pages/watch/components/VideoInfo.tsx
import React from "react";
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Eye, Clock, User } from "lucide-react";
import type { VideoInfo } from "../../../services/youtube";

interface VideoInfoProps {
  info: VideoInfo;
  viewCount?: string;
}

export const VideoInfoSection: React.FC<VideoInfoProps> = ({ info, viewCount }) => {
  return (
    <div className="mt-4">
      <h1 className="text-xl font-bold text-white">{info.title}</h1>
      <div className="flex flex-wrap justify-between items-center mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center">
            <User size={20} className="text-gray-300" />
          </div>
          <div>
            <p className="font-medium text-white">{info.channel}</p>
            <p className="text-xs text-gray-400">YouTube channel</p>
          </div>
          <button className="ml-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-full text-white text-sm font-medium transition">
            Subscribe
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {[
            { icon: ThumbsUp, label: "Like" },
            { icon: ThumbsDown, label: "" },
            { icon: Share2, label: "Share" },
            { icon: Download, label: "Download" },
          ].map(({ icon: Icon, label }, idx) => (
            <button
              key={idx}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#272727] rounded-full hover:bg-[#3f3f3f] text-white transition"
            >
              <Icon size={16} />
              {label && <span className="text-sm">{label}</span>}
            </button>
          ))}
          <button className="p-2 rounded-full hover:bg-[#272727] text-white">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Eye size={14} />
          <span>{viewCount || "—"} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>Streamed live</span>
        </div>
      </div>
    </div>
  );
};