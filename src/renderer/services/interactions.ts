// src/renderer/services/youtube/interactions.ts
export async function subscribe(channelId: string): Promise<{ success: boolean }> {
  return await window.backendAPI.subscribe(channelId);
}

export async function unsubscribe(channelId: string): Promise<{ success: boolean }> {
  return await window.backendAPI.unsubscribe(channelId);
}

export async function likeVideo(videoId: string): Promise<{ success: boolean }> {
  return await window.backendAPI.likeVideo(videoId);
}

export async function dislikeVideo(videoId: string): Promise<{ success: boolean }> {
  return await window.backendAPI.dislikeVideo(videoId);
}

export async function commentOnVideo(videoId: string, text: string): Promise<{ success: boolean; commentId?: string }> {
  return await window.backendAPI.commentOnVideo(videoId, text);
}