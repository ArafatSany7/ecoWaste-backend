import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CollectorValidation } from "./collector.validation";
import { CollectorController } from "./collector.controller";
import { trackingLimiter } from "../../middlewares/rateLimiters";
import { TrackingController } from "../tracking/tracking.controller";
import { TrackingValidation } from "../tracking/tracking.validation";

const router = express.Router();

router.get("/", auth("ADMIN"), CollectorController.getAllCollectors);

router.get("/:id", auth("ADMIN"), CollectorController.getCollectorById);

router.patch(
  "/me/availability",
  auth("COLLECTOR"),
  validateRequest(CollectorValidation.updateAvailabilitySchema),
  CollectorController.toggleAvailability
);

router.get("/me/jobs", auth("COLLECTOR"), CollectorController.getMyJobs);

// Live GPS while on a trip. Polled every few seconds, so it has its own rate limit.
router.patch(
  "/me/location",
  trackingLimiter,
  auth("COLLECTOR"),
  validateRequest(TrackingValidation.updateLocationSchema),
  TrackingController.updateMyLocation
);

// SCHEDULED -> EN_ROUTE: collector starts driving to the pickup; tracking goes live.
router.patch(
  "/requests/:id/depart",
  auth("COLLECTOR"),
  CollectorController.departForPickup
);

router.patch(
  "/requests/:id/arrive",
  auth("COLLECTOR"),
  CollectorController.arriveAtLocation
);

router.patch(
  "/requests/:id/start",
  auth("COLLECTOR"),
  CollectorController.startCollection
);

router.post(
  "/requests/:id/complete",
  auth("COLLECTOR"),
  validateRequest(CollectorValidation.completeCollectionSchema),
  CollectorController.completeCollection
);

export const CollectorRoutes = router;
