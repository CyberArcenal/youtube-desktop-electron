// src/renderer/services/youtube/interactions.ts

export async function subscribe(channelId: string): Promise<{ success: boolean }> {
  try {
    return (await window.backendAPI.subscribe(channelId)) as { success: boolean };
  } catch (err) {
    return { success: false };
  }
}

export async function unsubscribe(channelId: string): Promise<{ success: boolean }> {
  try {
    return (await window.backendAPI.unsubscribe(channelId)) as { success: boolean };
  } catch (err) {
    return { success: false };
  }
}

export async function likeVideo(videoId: string): Promise<{ success: boolean }> {
  try {
    return (await window.backendAPI.likeVideo(videoId)) as { success: boolean };
  } catch (err) {
    return { success: false };
  }
}

export async function dislikeVideo(videoId: string): Promise<{ success: boolean }> {
  try {
    return (await window.backendAPI.dislikeVideo(videoId)) as { success: boolean };
  } catch (err) {
    return { success: false };
  }
}

export async function commentOnVideo(
  videoId: string,
  text: string
): Promise<{ success: boolean; commentId?: string }> {
  try {
    return (await window.backendAPI.commentOnVideo(videoId, text)) as { success: boolean; commentId?: string };
  } catch (err) {
    return { success: false };
  }
}