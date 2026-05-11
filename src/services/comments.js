// src/main/services/youtube/comments.js
//@ts-check
const core = require("./core");
const { extractText } = require("./utils");
const { logger } = require("../utils/logger");

// Helper to parse comment thread
/**
 * @param {{ comment: any; }} thread
 */
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
/**
 * @param {any} videoId
 */
async function getVideoComments(videoId) {
  const yt = await core.getInnertube();
  const comments = await yt.getComments(videoId);
  return (comments?.contents || [])
    .map((/** @type {{ comment: any; }} */ thread) => {
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
    })
    .filter(Boolean);
}
/**
 * @param {any} videoId
 */
async function getVideoCommentsWithToken(videoId) {
  try {
    const yt = await core.getInnertube();
    const commentsPage = await yt.getComments(videoId);

    // Log for debugging
    logger.info(`Comments page keys: ${Object.keys(commentsPage)}`);
    logger.info(`Has continuation? ${!!commentsPage.continuation}`);

    let comments = [];
    if (commentsPage.contents && Array.isArray(commentsPage.contents)) {
      comments = commentsPage.contents.map(parseCommentThread).filter(Boolean);
    } else if (commentsPage.comments && Array.isArray(commentsPage.comments)) {
      // Alternative structure
      comments = commentsPage.comments.map(parseCommentThread).filter(Boolean);
    } else {
      logger.warn("No comments array found in response");
    }

    const continuation = commentsPage.continuation || null;
    return { comments, continuation };
  } catch (err) {
    // @ts-ignore
    logger.error("getVideoCommentsWithToken failed:", err);
    return { comments: [], continuation: null };
  }
}

/**
 * @param {any} videoId
 * @param {any} continuation
 */
async function getMoreComments(videoId, continuation) {
  try {
    const yt = await core.getInnertube();
    const nextPage = await yt.getComments(videoId, { continuation });

    let comments = [];
    if (nextPage.contents && Array.isArray(nextPage.contents)) {
      comments = nextPage.contents.map(parseCommentThread).filter(Boolean);
    } else if (nextPage.comments && Array.isArray(nextPage.comments)) {
      comments = nextPage.comments.map(parseCommentThread).filter(Boolean);
    }

    const newContinuation = nextPage.continuation || null;
    return { comments, continuation: newContinuation };
  } catch (err) {
    // @ts-ignore
    logger.error("getMoreComments failed:", err);
    return { comments: [], continuation: null };
  }
}

module.exports = {
  getVideoComments,
  getVideoCommentsWithToken,
  getMoreComments,
};
