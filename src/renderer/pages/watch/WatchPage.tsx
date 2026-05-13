// src/renderer/pages/watch/WatchPage.tsx
import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { VideoPlayer } from "./components/VideoPlayer";
import { VideoInfoSection } from "./components/VideoInfo";
import { CommentsSection } from "./components/CommentsSection";
import { RelatedVideosSidebar } from "./components/RelatedVideosSidebar";
import { MiniPlayer } from "./components/MiniPlayer";
import { useWatchData } from "./hooks/useWatchData";
import { useComments } from "./hooks/useComments";

const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { videoInfo, streamingUrl, related, loading, error } =
    useWatchData(videoId);
  const {
    comments,
    loading: commentsLoading,
    hasMore,
    loadMore,
    addReply,
    likeComment,
  } = useComments(videoId);

  // Refs to detect when main player leaves viewport
  const mainPlayerRef = useRef<HTMLDivElement>(null);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);

  useEffect(() => {
    if (!mainPlayerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMiniPlayer(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" }, // Trigger when player moves above top bar
    );
    observer.observe(mainPlayerRef.current);
    return () => observer.disconnect();
  }, [videoInfo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !videoInfo) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error || "Video not found"}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content column */}
        <div className="flex-1 min-w-0">
          {/* Main video player container (observed for sticky) */}
          <div ref={mainPlayerRef}>
            <VideoPlayer src={streamingUrl} title={videoInfo.title} />
          </div>
          <VideoInfoSection info={videoInfo} />
          <CommentsSection
            comments={comments}
            loading={commentsLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onReply={addReply}
            onLikeComment={likeComment}
          />
        </div>

        {/* Sidebar column – independent scroll */}
        <div className="lg:w-96 relative">
          <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide pr-2">
            <RelatedVideosSidebar videos={related} />
          </div>
        </div>
      </div>

      {/* Floating Mini Player */}
      {showMiniPlayer && streamingUrl && (
        <MiniPlayer
          src={streamingUrl}
          title={videoInfo.title}
          onClose={() => setShowMiniPlayer(false)}
        />
      )}
    </div>
  );
};

export default WatchPage;
