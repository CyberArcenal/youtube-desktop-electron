// src/renderer/services/youtube/comments.ts
import type { Comment, CommentsPage } from "./types";

/**
 * Return the initial comments array for a video.
 * Uses the same backend channel as getCommentsInitial.
 */
export async function getVideoComments(videoId: string): Promise<Comment[]> {
  try {
    const page = (await window.backendAPI.getCommentsInitial(videoId)) as CommentsPage;
    return page?.comments ?? [];
  } catch (err) {
    // treat failure as "no comments" so UI can handle gracefully
    return [];
  }
}

/**
 * Return the full comments page (comments + continuation token).
 */
export async function getCommentsInitial(videoId: string): Promise<CommentsPage> {
  try {
    return (await window.backendAPI.getCommentsInitial(videoId)) as CommentsPage;
  } catch (err) {
    return { comments: [], continuation: null };
  }
}

/**
 * Fetch more comments using a continuation token.
 */
export async function getMoreComments(videoId: string, continuation: string): Promise<CommentsPage> {
  try {
    return (await window.backendAPI.getMoreComments(videoId, continuation)) as CommentsPage;
  } catch (err) {
    return { comments: [], continuation: null };
  }
}

/**
 * Reply to a comment.
 */
export async function replyToComment(
  commentId: string,
  text: string
): Promise<{ success: boolean; replyId?: string }> {
  try {
    return (await window.backendAPI.replyToComment(commentId, text)) as { success: boolean; replyId?: string };
  } catch (err) {
    return { success: false };
  }
}

/**
 * Like a comment.
 */
export async function likeComment(commentId: string): Promise<{ success: boolean }> {
  try {
    return (await window.backendAPI.likeComment(commentId)) as { success: boolean };
  } catch (err) {
    return { success: false };
  }
}