import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CollectorValidation } from "./collector.validation";
import { CollectorController } from "./collector.controller";

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
