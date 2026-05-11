// src/renderer/pages/watch/components/VideoPlayer.tsx
import React, { useRef, useEffect } from "react";

interface VideoPlayerProps {
  src: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
      <video
        ref={videoRef}
        src={src}
        controls
        autoPlay
        className="w-full h-full"
        title={title}
      />
    </div>
  );
};