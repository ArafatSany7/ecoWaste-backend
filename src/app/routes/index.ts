import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ZoneRoutes } from "../modules/zone/zone.route";
import { WasteCategoryRoutes } from "../modules/wasteCategory/wasteCategory.route";
import { WasteRequestRoutes } from "../modules/wasteRequest/wasteRequest.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { CollectorRoutes } from "../modules/collector/collector.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/zones",
    route: ZoneRoutes,
  },
  {
    path: "/waste-categories",
    route: WasteCategoryRoutes,
  },
  {
    path: "/waste-requests",
    route: WasteRequestRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/collectors",
    route: CollectorRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
