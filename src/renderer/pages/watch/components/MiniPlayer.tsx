// src/renderer/pages/watch/components/MiniPlayer.tsx
import React, { useRef, useEffect } from "react";
import { X, Minimize2 } from "lucide-react";

interface MiniPlayerProps {
  src: string;
  title: string;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ src, title, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Maintain original video playback state when mini player appears
  useEffect(() => {
    const mainVideo = document.querySelector("video");
    if (mainVideo && videoRef.current) {
      const currentTime = mainVideo.currentTime;
      const isPlaying = !mainVideo.paused;
      videoRef.current.currentTime = currentTime;
      if (isPlaying) videoRef.current.play();
    }
  }, [src]);

  // Optional: sync time back when mini player is closed (if needed)
  const handleClose = () => {
    const mainVideo = document.querySelector("video");
    if (mainVideo && videoRef.current) {
      mainVideo.currentTime = videoRef.current.currentTime;
      if (!videoRef.current.paused) mainVideo.play();
    }
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-50 bg-black rounded-lg shadow-2xl overflow-hidden w-80 md:w-96 transition-all duration-300 animate-in slide-in-from-right-10"
    >
      <div className="relative">
        <video
          ref={videoRef}
          src={src}
          controls
          className="w-full"
          title={title}
        />
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-black text-white transition"
          aria-label="Close mini player"
        >
          <X size={16} />
        </button>
        <button
          onClick={() => {
            const mainVideo = document.querySelector("video");
            if (mainVideo && videoRef.current) {
              mainVideo.currentTime = videoRef.current.currentTime;
              if (!videoRef.current.paused) mainVideo.play();
            }
            onClose();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="absolute top-2 right-10 p-1 rounded-full bg-black/70 hover:bg-black text-white transition"
          aria-label="Expand"
        >
          <Minimize2 size={16} />
        </button>
      </div>
      <div className="p-2 text-sm font-medium text-white truncate bg-black/80">
        {title}
      </div>
    </div>
  );
};