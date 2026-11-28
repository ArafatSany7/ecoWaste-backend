import express from "express";
import auth from "../../middlewares/auth";
import { trackingLimiter } from "../../middlewares/rateLimiters";
import { NotificationController } from "./notification.controller";

const router = express.Router();

router.get(
	"/",
	trackingLimiter,
	auth("CITIZEN", "COLLECTOR", "ADMIN"),
	NotificationController.getMyNotifications,
);

router.patch(
	"/read-all",
	auth("CITIZEN", "COLLECTOR", "ADMIN"),
	NotificationController.markAllRead,
);

router.patch(
	"/:id/read",
	auth("CITIZEN", "COLLECTOR", "ADMIN"),
	NotificationController.markRead,
);

export const NotificationRoutes = router;
