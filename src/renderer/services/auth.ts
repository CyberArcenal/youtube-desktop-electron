// src/renderer/services/youtube/auth.ts
export async function authenticate() {
  return await window.backendAPI.youtubeAuthenticate();
}

export async function isLoggedIn() {
  return await window.backendAPI.isYouTubeLoggedIn();
}