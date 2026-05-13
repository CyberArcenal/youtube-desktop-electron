// src/renderer/pages/watch/components/VideoInfo.tsx
import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, User, Check, Clipboard } from "lucide-react";
import type { VideoInfo } from "../../../services/types";

interface VideoInfoProps {
  info: VideoInfo;
}

export const VideoInfoSection: React.FC<VideoInfoProps> = ({ info }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  return (
    <div className="mt-4">
      <h1 className="text-xl font-bold text-white">{info.title}</h1>

      {/* Channel & Actions row */}
      <div className="flex flex-wrap justify-between items-center mt-2 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center overflow-hidden">
            {info.channelAvatar ? (
              <img src={info.channelAvatar} alt={info.channel} className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-gray-300" />
            )}
          </div>
          <div>
            <p className="font-medium text-white">{info.channel}</p>
            <p className="text-xs text-gray-400">{(info.subscriberCount && formatNumber(info.subscriberCount)) + " subscribers"}</p>
          </div>
          <button
            onClick={() => setIsSubscribed(!isSubscribed)}
            className={`ml-2 px-4 py-1.5 rounded-full text-sm font-medium transition ${
              isSubscribed
                ? "bg-[#272727] text-white hover:bg-[#3f3f3f]"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Like button */}
          <div className="flex rounded-full bg-[#272727] overflow-hidden">
            <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-[#3f3f3f] transition">
              <ThumbsUp size={16} />
              <span className="text-sm">{formatNumber(info.likeCount)}</span>
            </button>
            <div className="w-px bg-[#3f3f3f]" />
            <button className="px-3 py-1.5 hover:bg-[#3f3f3f] transition">
              <ThumbsDown size={16} />
            </button>
          </div>

          {/* Share button with tooltip */}
          <div className="relative">
            <button
              onClick={copyLink}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#272727] rounded-full hover:bg-[#3f3f3f] transition"
            >
              <Share2 size={16} />
              <span className="text-sm hidden sm:inline">Share</span>
            </button>
            {showShareTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
                Link copied!
              </div>
            )}
          </div>

          <button className="flex items-center gap-1 px-3 py-1.5 bg-[#272727] rounded-full hover:bg-[#3f3f3f] transition">
            <Download size={16} />
            <span className="text-sm hidden sm:inline">Download</span>
          </button>

          <button className="p-2 rounded-full hover:bg-[#272727] transition">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* View count & description */}
      <div className="mt-3 text-sm text-gray-400 space-y-2">
        <div className="flex items-center gap-2">
          <span>{formatNumber(info.viewCount)} views</span>
          <span>•</span>
          <span>{info.publishedDate || "Streamed live"}</span>
        </div>

        {info.description && (
          <div className="bg-[#1a1a1a] rounded-lg p-3">
            <p className={`text-white text-sm whitespace-pre-wrap ${descriptionExpanded ? "" : "line-clamp-2"}`}>
              {info.description}
            </p>
            <button
              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              className="text-gray-400 hover:text-white text-xs font-medium mt-1"
            >
              {descriptionExpanded ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};