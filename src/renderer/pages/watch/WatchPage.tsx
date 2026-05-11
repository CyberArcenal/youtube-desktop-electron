// src/renderer/pages/watch/WatchPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { VideoPlayer } from "./components/VideoPlayer";
import { VideoInfoSection } from "./components/VideoInfo";
import { CommentsSection } from "./components/CommentsSection";
import { RelatedVideosSidebar } from "./components/RelatedVideosSidebar";
import { useWatchData } from "./hooks/useWatchData";
import { useComments } from "./hooks/useComments";

const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { videoInfo, streamingUrl, related, loading, error } = useWatchData(videoId);
  const {
    comments,
    loading: commentsLoading,
    hasMore,
    loadMore,
    addReply,
    likeComment,
  } = useComments(videoId);

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
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <VideoPlayer src={streamingUrl} title={videoInfo.title} />
          <VideoInfoSection info={videoInfo} viewCount={videoInfo.viewCount} />
          <CommentsSection
            comments={comments}
            loading={commentsLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onReply={addReply}
            onLikeComment={likeComment}
          />
        </div>
        {/* Sidebar */}
        <RelatedVideosSidebar videos={related} />
      </div>
    </div>
  );
};

export default WatchPage;