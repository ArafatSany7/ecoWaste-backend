import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { ZoneValidation } from "./zone.validation";
import { ZoneController } from "./zone.controller";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(ZoneValidation.createZoneSchema),
  ZoneController.createZone
);

router.get("/", ZoneController.getAllZones);

router.get("/:id", ZoneController.getZoneById);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(ZoneValidation.updateZoneSchema),
  ZoneController.updateZone
);

router.delete(
  "/:id",
  auth("ADMIN"),
  ZoneController.deleteZone
);

export const ZoneRoutes = router;
