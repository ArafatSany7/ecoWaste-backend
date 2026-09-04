import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { WasteRequestValidation } from "./wasteRequest.validation";
import { WasteRequestController } from "./wasteRequest.controller";

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

export const WasteRequestRoutes = router;
