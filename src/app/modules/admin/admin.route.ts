import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AdminController } from "./admin.controller";
import { CollectorValidation } from "../collector/collector.validation";
import { AdminValidation } from "./admin.validation";

const router = express.Router();

router.patch(
  "/requests/:id/approve",
  auth("ADMIN"),
  AdminController.approveWasteRequest
);

router.patch(
  "/requests/:id/reject",
  auth("ADMIN"),
  AdminController.rejectWasteRequest
);

router.post(
  "/collectors",
  auth("ADMIN"),
  validateRequest(CollectorValidation.createCollectorSchema),
  AdminController.createCollector
);

router.post(
  "/requests/:id/assign",
  auth("ADMIN"),
  validateRequest(AdminValidation.assignCollectorSchema),
  AdminController.assignCollector
);

router.post(
  "/requests/:id/schedule",
  auth("ADMIN"),
  validateRequest(AdminValidation.scheduleWasteRequestSchema),
  AdminController.scheduleWasteRequest
);

export const AdminRoutes = router;
