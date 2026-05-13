// src/renderer/services/youtube/auth.ts
export type AuthResult = any;

export interface UserInfo {
  name?: string;
  email?: string;
  avatar?: string;
  channelId?: string;
  [key: string]: any;
}

/**
 * Start device auth flow via preload backendAPI.
 * Resolves with whatever the main process returns (AuthResult).
 */
export async function authenticate(): Promise<AuthResult> {
  try {
    return await window.backendAPI.youtubeAuthenticate();
  } catch (err) {
    throw err instanceof Error ? err : new Error(String(err));
  }
}

/**
 * Check whether the user is logged in.
 * Returns boolean or backend-specific payload.
 */
export async function isLoggedIn(): Promise<boolean | any> {
  try {
    return await window.backendAPI.isYouTubeLoggedIn();
  } catch (err) {
    return false;
  }
}

/**
 * Sign out the current session.
 * Resolves when sign out completes.
 */
export async function signOut(): Promise<any> {
  try {
    return await window.backendAPI.signOut();
  } catch (err) {
    throw err instanceof Error ? err : new Error(String(err));
  }
}

/**
 * Fetch a small user summary from the main process.
 */
export async function getUserInfo(): Promise<UserInfo | null> {
  try {
    const res = await window.backendAPI.getUserInfo();
    return res ?? null;
  } catch (err) {
    return null;
  }
}