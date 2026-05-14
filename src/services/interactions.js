// src/main/services/youtube/interactions.js
const core = require("./core");
const { logger } = require("../utils/logger");

async function ensureLoggedIn() {
  const yt = await core.getInnertube();
  if (!yt.session.logged_in) throw new Error("Must be logged in to perform this action");
  return yt;
}

async function subscribe(channelId) {
  try {
    const yt = await ensureLoggedIn();
    await yt.interact.subscribe(channelId);
    return { success: true };
  } catch (err) {
    logger.error("Subscribe failed:", err.message);
    throw err;
  }
}

async function unsubscribe(channelId) {
  try {
    const yt = await ensureLoggedIn();
    await yt.interact.unsubscribe(channelId);
    return { success: true };
  } catch (err) {
    logger.error("Unsubscribe failed:", err.message);
    throw err;
  }
}

async function likeVideo(videoId) {
  try {
    const yt = await core.getInnertube();
    await yt.interact.like(videoId);
    return { success: true };
  } catch (err) {
    logger.error("Like video failed:", err.message);
    throw err;
  }
}

async function dislikeVideo(videoId) {
  try {
    const yt = await core.getInnertube();
    await yt.interact.dislike(videoId);
    return { success: true };
  } catch (err) {
    logger.error("Dislike video failed:", err.message);
    throw err;
  }
}

async function commentOnVideo(videoId, text) {
  try {
    const yt = await ensureLoggedIn();
    const res = await yt.interact.comment(videoId, text);
    return { success: true, commentId: res?.id };
  } catch (err) {
    logger.error("Comment failed:", err.message);
    throw err;
  }
}

async function replyToComment(commentId, text) {
  try {
    const yt = await ensureLoggedIn();
    const res = await yt.interact.reply(commentId, text);
    return { success: true, replyId: res?.id };
  } catch (err) {
    logger.error("Reply failed:", err.message);
    throw err;
  }
}

async function likeComment(commentId) {
  try {
    const yt = await core.getInnertube();
    await yt.interact.likeComment(commentId);
    return { success: true };
  } catch (err) {
    logger.error("Like comment failed:", err.message);
    throw err;
  }
}

module.exports = {
  subscribe,
  unsubscribe,
  likeVideo,
  dislikeVideo,
  commentOnVideo,
  replyToComment,
  likeComment,
};