import rateLimit from "express-rate-limit";

/**
 * Live-tracking endpoints are polled every few seconds (location pushes from collectors,
 * tracking reads from citizens), so they get their own, higher budget and are excluded from
 * the general API limiter.
 */
export const TRACKING_PATH =
	/^\/api\/v1\/(collectors\/me\/location|waste-requests\/[^/]+\/tracking|notifications)\/?$/;

export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: "Too many requests from this IP, please try again later.",
	skip: (req) => TRACKING_PATH.test(req.originalUrl.split("?")[0]),
});

export const trackingLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	// 5 s polling = 180 per 15 min per open screen; leave headroom for a few tabs.
	limit: 600,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: "Too many tracking requests, please slow down.",
});
