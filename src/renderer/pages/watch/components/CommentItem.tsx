// src/renderer/pages/watch/components/CommentItem.tsx
import React, { useState } from "react";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { ReplyInput } from "./ReplyInput";
import type { Comment } from "../../../services/youtube";

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, text: string) => void;
  onLike: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onLike }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-[#272727] flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{comment.author}</p>
        <p className="text-sm text-gray-300 mt-0.5">{comment.text}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <button
            onClick={() => onLike(comment.id)}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <ThumbsUp size={12} /> <span>{comment.likes}</span>
          </button>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <MessageCircle size={12} /> Reply
          </button>
        </div>
        {showReplyInput && (
          <ReplyInput
            onSubmit={(text) => {
              onReply(comment.id, text);
              setShowReplyInput(false);
            }}
            onCancel={() => setShowReplyInput(false)}
          />
        )}
      </div>
    </div>
  );
};