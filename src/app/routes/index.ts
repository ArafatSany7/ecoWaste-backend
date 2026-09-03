import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ZoneRoutes } from "../modules/zone/zone.route";
import { WasteCategoryRoutes } from "../modules/wasteCategory/wasteCategory.route";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
