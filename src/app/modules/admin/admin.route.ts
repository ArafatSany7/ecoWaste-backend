import express from "express";
import auth from "../../middlewares/auth";
import { AdminController } from "./admin.controller";

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

export const AdminRoutes = router;
