import express from "express";
import auth from "../../middlewares/auth";
import { AnalyticsController } from "./analytics.controller";

const router = express.Router();

router.get("/admin-dashboard", auth("ADMIN"), AnalyticsController.getAdminDashboardMetrics);

export const AnalyticsRoutes = router;
