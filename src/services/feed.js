// src/main/services/youtube/feed.js
const core = require("./core");
const { _formatVideo } = require("./utils");
const { logger } = require("../utils/logger");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");


async function getHomeFeed(continuation = null) {
    try {
        const yt = await core.getInnertube();
        let feed = await yt.getHomeFeed();

        // --- 🔍 I-save ang raw data para sa debug ---
        const dumpPath = path.join(app.getPath("userData"), "feed-debug.json");
        fs.writeFileSync(dumpPath, JSON.stringify(feed, null, 2), "utf8");
        logger.info(`[HomeFeed DEBUG] Full feed saved to: ${dumpPath}`);

        // I-log ang section info
        if (feed.contents?.contents) {
            logger.info(`[HomeFeed DEBUG] Sections count: ${feed.contents.contents.length}`);
            feed.contents.contents.forEach((section, i) => {
                const t = section.type || "?";
                const ct = section.content?.type || "no-content";
                const hasItems = section.content?.contents?.length || section.content?.items?.length || 0;
                logger.info(`[HomeFeed DEBUG] Section ${i}: type=${t}, content.type=${ct}, items=${hasItems}`);
            });
        }

        // 1. Subukan ang built‑in .videos
        let videos = (feed.videos || []).map(_formatVideo).filter(Boolean);

        // 2. Kung wala, fallback sa trending (gamit ang search)
        if (videos.length === 0) {
            logger.info("[HomeFeed] No videos from home feed, falling back to trending");
            try {
                const searchModule = require("./search");
                const trendingResult = await searchModule.searchVideos("trending");
                videos = (trendingResult.videos || []).map(_formatVideo).filter(Boolean);
                logger.info(`[HomeFeed] Got ${videos.length} videos from Trending`);
            } catch (trendingError) {
                logger.warn("Trending fallback failed:", trendingError.message);
            }
        }

        return {
            videos,
            continuation: feed.continuation || null,
        };
    } catch (err) {
        logger.error("getHomeFeed failed:", err.message);
        return { videos: [], continuation: null };
    }
}

async function getSubscriptionsFeed(continuation = null) {
    try {
        const yt = await core.getInnertube();
        if (!yt.session.logged_in) {
            return { videos: [], continuation: null };
        }

        let feed;
        if (continuation) {
            feed = await yt.getSubscriptionsFeed({ continuation });
        } else {
            feed = await yt.getSubscriptionsFeed();
        }

        const videos = (feed.videos || []).map(_formatVideo).filter(Boolean);
        return { videos, continuation: feed.continuation || null };
    } catch (err) {
        logger.error("getSubscriptionsFeed failed:", err.message);
        return { videos: [], continuation: null };
    }
}

async function getTrendingVideos(continuation = null) {
    try {
        const searchModule = require("./search");
        const result = await searchModule.searchVideos("trending", continuation);
        return (result.videos || []).map(_formatVideo).filter(Boolean);
    } catch (err) {
        logger.error("getTrendingVideos failed:", err.message);
        return [];
    }
}

module.exports = { getHomeFeed, getSubscriptionsFeed, getTrendingVideos };