import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { WasteRequestValidation } from "./wasteRequest.validation";
import { WasteRequestController } from "./wasteRequest.controller";
import { trackingLimiter } from "../../middlewares/rateLimiters";
import { TrackingController } from "../tracking/tracking.controller";

const router = express.Router();

router.post(
  "/",
  auth("CITIZEN"),
  validateRequest(WasteRequestValidation.createWasteRequestSchema),
  WasteRequestController.createWasteRequest
);

router.get("/my-requests", auth("CITIZEN"), WasteRequestController.getMyWasteRequests);
router.get("/", auth("ADMIN"), WasteRequestController.getAllWasteRequests);
router.get("/:id", auth("CITIZEN", "ADMIN"), WasteRequestController.getWasteRequestById);

// Live tracking (status, destination, collector position, ETA). Polled, so separately limited.
router.get(
  "/:id/tracking",
  trackingLimiter,
  auth("CITIZEN", "COLLECTOR", "ADMIN"),
  TrackingController.getRequestTracking
);

export const WasteRequestRoutes = router;
