// src/renderer/pages/watch/components/CommentsSection.tsx
import React from "react";
import { MessageCircle } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { LoadMoreButton } from "./LoadMoreButton";
import type { Comment } from "../../../services/youtube";

interface CommentsSectionProps {
  comments: Comment[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onReply: (commentId: string, text: string) => void;
  onLikeComment: (commentId: string) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  loading,
  hasMore,
  onLoadMore,
  onReply,
  onLikeComment,
}) => {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={18} className="text-white" />
        <span className="text-white font-medium">{comments.length} Comments</span>
      </div>
      <div className="space-y-5">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={onReply}
            onLike={onLikeComment}
          />
        ))}
      </div>
      {hasMore && (
        <LoadMoreButton onClick={onLoadMore} loading={loading} />
      )}
    </div>
  );
};