// src/renderer/services/youtube/comments.ts
import type { Comment, CommentsPage } from "./types";

export async function getVideoComments(videoId: string): Promise<Comment[]> {
  return await window.backendAPI.getYouTubeComments(videoId);
}

export async function getCommentsInitial(videoId: string): Promise<CommentsPage> {
  return await window.backendAPI.getCommentsInitial(videoId);
}

export async function getMoreComments(videoId: string, continuation: string): Promise<CommentsPage> {
  return await window.backendAPI.getMoreComments(videoId, continuation);
}

export async function replyToComment(commentId: string, text: string): Promise<{ success: boolean; replyId?: string }> {
  return await window.backendAPI.replyToComment(commentId, text);
}

export async function likeComment(commentId: string): Promise<{ success: boolean }> {
  return await window.backendAPI.likeComment(commentId);
}