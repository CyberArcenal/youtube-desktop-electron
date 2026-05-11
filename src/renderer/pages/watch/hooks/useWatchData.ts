// src/renderer/pages/watch/hooks/useWatchData.ts
import { useEffect, useState } from "react";
import {
  getVideoInfo,
  getVideoStreamingUrl,
  getRelatedVideos,
  type VideoInfo,
  type VideoItem,
} from "../../../services/youtube";

export function useWatchData(videoId: string | undefined) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [streamingUrl, setStreamingUrl] = useState<string>("");
  const [related, setRelated] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [info, url, relatedVideos] = await Promise.all([
          getVideoInfo(videoId),
          getVideoStreamingUrl(videoId),
          getRelatedVideos(videoId),
        ]);
        setVideoInfo(info);
        setStreamingUrl(url);
        setRelated(relatedVideos);
      } catch (err: any) {
        setError(err.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [videoId]);

  return { videoInfo, streamingUrl, related, loading, error };
}