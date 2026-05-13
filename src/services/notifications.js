// src/main/services/youtube/notifications.js

const core = require("./core");
const { extractText } = require("./utils");
const { logger } = require("../utils/logger");

/**
 * Map YouTube notification types to our UI types
 */
function mapNotificationType(notification) {
  const type = notification.type || notification.notificationType;
  if (type?.includes("LIKE")) return "success";
  if (type?.includes("COMMENT")) return "info";
  if (type?.includes("SUBSCRIPTION")) return "purchase";
  if (type?.includes("SHARE")) return "sale";
  if (type?.includes("UPLOAD")) return "info";
  if (type?.includes("LIVE")) return "warning";
  return "info";
}

/**
 * Format a raw YouTube notification into our app's Notification object
 */
function formatNotification(raw) {
  const id = raw.id || raw.notificationId;
  const title = extractText(raw.title) || "YouTube Update";
  const message = extractText(raw.message) || "";
  const type = mapNotificationType(raw);
  const isRead = raw.read === true || raw.isRead === true;
  const createdAt = raw.sentTime ? new Date(raw.sentTime) : new Date();
  let metadata = null;
  if (raw.videoId) metadata = { videoId: raw.videoId };
  else if (raw.channelId) metadata = { channelId: raw.channelId };
  else if (raw.commentId) metadata = { commentId: raw.commentId };

  return { id, title, message, type, isRead, createdAt, metadata };
}

/**
 * Fetch notifications with pagination
 * @param {string|null} continuation - token for next page
 * @param {number} limit - max items per page (ignored by YouTube, but we slice)
 * @returns {Promise<{notifications: Array, continuation: string|null}>}
 */
async function getNotifications(continuation = null, limit = 20) {
  try {
    const yt = await core.getInnertube();
    if (!yt || !yt.session) {
      logger.warn("getNotifications: Innertube or session unavailable");
      return { notifications: [], continuation: null };
    }

    let response;
    if (continuation) {
      response = await yt.getNotifications(continuation);
    } else {
      response = await yt.getNotifications();
    }

    let rawNotifications = [];
    let nextContinuation = null;

    // Different youtubei.js versions have different structures
    if (response && Array.isArray(response.notifications)) {
      rawNotifications = response.notifications;
      nextContinuation = response.continuation || null;
    } else if (
      response &&
      response.contents &&
      Array.isArray(response.contents)
    ) {
      rawNotifications = response.contents;
      nextContinuation = response.continuation || null;
    } else if (response && response.items && Array.isArray(response.items)) {
      rawNotifications = response.items;
      nextContinuation = response.continuation || null;
    } else {
      logger.warn(
        "Unknown notifications response structure",
        Object.keys(response || {}),
      );
    }

    const formatted = rawNotifications
      .map((n) => formatNotification(n))
      .filter((n) => n.id);

    // Limit if needed (YouTube often returns ~20-30 per page)
    const limited = formatted.slice(0, limit);

    return { notifications: limited, continuation: nextContinuation };
  } catch (err) {
    logger.error("getNotifications failed:", err.message);
    return { notifications: [], continuation: null };
  }
}

/**
 * Mark a single notification as read
 * @param {string} notificationId
 */
async function markNotificationAsRead(notificationId) {
  try {
    const yt = await core.getInnertube();
    if (!yt || !yt.session) {
      throw new Error("Not authenticated");
    }
    // Use the library's method if available
    if (typeof yt.markNotificationAsRead === "function") {
      await yt.markNotificationAsRead(notificationId);
    } else if (typeof yt.interact?.markNotificationAsRead === "function") {
      await yt.interact.markNotificationAsRead(notificationId);
    } else {
      // Fallback – might not be supported; log and assume success
      logger.warn("markNotificationAsRead method not found in Innertube");
    }
    return { success: true };
  } catch (err) {
    logger.error("markNotificationAsRead failed:", err.message);
    throw err;
  }
}

/**
 * Mark all notifications as read
 */
async function markAllNotificationsAsRead() {
  try {
    const yt = await core.getInnertube();
    if (!yt || !yt.session) throw new Error("Not authenticated");

    // Attempt to use batch method if available
    if (typeof yt.markAllNotificationsAsRead === "function") {
      await yt.markAllNotificationsAsRead();
    } else {
      // Fallback: fetch first page and mark each individually (inefficient but works)
      const { notifications } = await getNotifications(null, 50);
      for (const n of notifications) {
        if (!n.isRead) {
          await markNotificationAsRead(n.id).catch((e) => logger.warn(e));
        }
      }
    }
    return { success: true };
  } catch (err) {
    logger.error("markAllNotificationsAsRead failed:", err.message);
    throw err;
  }
}

/**
 * Get unread count
 */
async function getUnreadNotificationCount() {
  try {
    // Fetch first page and count unread (YouTube doesn't provide raw count)
    const { notifications } = await getNotifications(null, 100);
    const unread = notifications.filter((n) => !n.isRead).length;
    return unread;
  } catch (err) {
    logger.error("getUnreadNotificationCount failed:", err.message);
    return 0;
  }
}

/**
 * Delete a notification (if supported)
 * Note: YouTube may not allow deletion via API; simulate by marking read
 */
async function deleteNotification(notificationId) {
  try {
    // YouTube doesn't expose delete, so we just mark as read
    await markNotificationAsRead(notificationId);
    return { success: true };
  } catch (err) {
    logger.error("deleteNotification failed:", err.message);
    throw err;
  }
}

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification,
};
