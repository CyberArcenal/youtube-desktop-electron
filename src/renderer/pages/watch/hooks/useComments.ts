// src/renderer/pages/watch/hooks/useComments.ts
import { useState, useEffect } from "react";
import { getCommentsInitial, getMoreComments, replyToComment, likeComment } from "../../../services/comments";
import type { Comment } from "../../../services/types";


export function useComments(videoId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [continuation, setContinuation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

const loadInitial = async () => {
  if (!videoId) return;
  setLoading(true);
  try {
    const result = await getCommentsInitial(videoId);
    console.log("Comments initial result:", result);
    setComments(result.comments);
    setContinuation(result.continuation);
    setHasMore(!!result.continuation);
  } catch (err) {
    console.error("Failed to load comments", err);
  } finally {
    setLoading(false);
  }
};

  const loadMore = async () => {
    if (!videoId || !continuation || !hasMore) return;
    setLoading(true);
    try {
      const { comments: newComments, continuation: nextCont } = await getMoreComments(videoId, continuation);
      setComments((prev) => [...prev, ...newComments]);
      setContinuation(nextCont);
      setHasMore(!!nextCont);
    } catch (err) {
      console.error("Failed to load more comments", err);
    } finally {
      setLoading(false);
    }
  };

  const addReply = (commentId: string, replyText: string) => {
    replyToComment(commentId, replyText)
      .then(() => {
        // Refresh comments to show the new reply (simplified: reload all)
        loadInitial();
      })
      .catch(console.error);
  };

  const likeCommentById = async (commentId: string) => {
    try {
      await likeComment(commentId);
      // Optimistic update
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        )
      );
    } catch (err) {
      console.error("Failed to like comment", err);
    }
  };

  useEffect(() => {
    loadInitial();
  }, [videoId]);

  return {
    comments,
    loading,
    hasMore,
    loadMore,
    addReply,
    likeComment: likeCommentById,
  };
}