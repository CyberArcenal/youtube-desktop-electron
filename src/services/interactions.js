// src/main/services/youtube/interactions.js
const core = require("./core");
const { logger } = require("../utils/logger");

async function subscribe(channelId) {
  const yt = await core.getInnertube();
  if (!yt.session.logged_in) throw new Error("Must be logged in");
  await yt.interact.subscribe(channelId);
  return { success: true };
}

async function unsubscribe(channelId) {
  const yt = await core.getInnertube();
  if (!yt.session.logged_in) throw new Error("Must be logged in");
  await yt.interact.unsubscribe(channelId);
  return { success: true };
}

async function likeVideo(videoId) {
  const yt = await core.getInnertube();
  await yt.interact.like(videoId);
  return { success: true };
}

async function dislikeVideo(videoId) {
  const yt = await core.getInnertube();
  await yt.interact.dislike(videoId);
  return { success: true };
}

async function commentOnVideo(videoId, text) {
  const yt = await core.getInnertube();
  if (!yt.session.logged_in) throw new Error("Must be logged in");
  const res = await yt.interact.comment(videoId, text);
  return { success: true, commentId: res?.id };
}

async function replyToComment(commentId, text) {
  const yt = await core.getInnertube();
  if (!yt.session.logged_in) throw new Error("Must be logged in");
  const res = await yt.interact.reply(commentId, text);
  return { success: true, replyId: res?.id };
}

async function likeComment(commentId) {
  const yt = await core.getInnertube();
  await yt.interact.likeComment(commentId);
  return { success: true };
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