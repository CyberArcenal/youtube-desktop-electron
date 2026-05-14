// src/main/services/youtube/comments.js
//@ts-check
const core = require("./core");
const { extractText } = require("./utils");
const { logger } = require("../utils/logger");

function parseCommentThread(thread) {
  const c = thread.comment;
  if (!c) return null;
  return {
    id: c.id,
    author: extractText(c.author?.name),
    authorId: c.author?.id,
    text: extractText(c.content),
    likes: c.like_count || 0,
    publishedDate: extractText(c.published),
  };
}

async function getVideoComments(videoId, continuation = null) {
  try {
    const yt = await core.getInnertube();
    const commentsPage = await yt.getComments(videoId, continuation ? { continuation } : undefined);
    
    let comments = [];
    if (commentsPage.contents && Array.isArray(commentsPage.contents)) {
      comments = commentsPage.contents.map(parseCommentThread).filter(Boolean);
    } else if (commentsPage.comments && Array.isArray(commentsPage.comments)) {
      comments = commentsPage.comments.map(parseCommentThread).filter(Boolean);
    } else {
      logger.warn("No comments array found in response");
    }
    
    const nextContinuation = commentsPage.continuation || null;
    return { comments, continuation: nextContinuation };
  } catch (err) {
    logger.error("getVideoComments failed:", err);
    return { comments: [], continuation: null };
  }
}

// For backward compatibility
async function getVideoCommentsWithToken(videoId) {
  return getVideoComments(videoId);
}

async function getMoreComments(videoId, continuation) {
  return getVideoComments(videoId, continuation);
}

module.exports = {
  getVideoComments,
  getVideoCommentsWithToken,
  getMoreComments,
};