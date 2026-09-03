import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { WasteCategoryValidation } from "./wasteCategory.validation";
import { WasteCategoryController } from "./wasteCategory.controller";

const router = express.Router();

router.post(
  "/",
  auth("ADMIN"),
  validateRequest(WasteCategoryValidation.createWasteCategorySchema),
  WasteCategoryController.createWasteCategory
);

router.get("/", WasteCategoryController.getAllWasteCategories);

router.get("/:id", WasteCategoryController.getWasteCategoryById);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(WasteCategoryValidation.updateWasteCategorySchema),
  WasteCategoryController.updateWasteCategory
);

router.delete(
  "/:id",
  auth("ADMIN"),
  WasteCategoryController.deleteWasteCategory
);

export const WasteCategoryRoutes = router;
