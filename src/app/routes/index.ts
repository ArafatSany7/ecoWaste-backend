import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ZoneRoutes } from "../modules/zone/zone.route";
import { WasteCategoryRoutes } from "../modules/wasteCategory/wasteCategory.route";
import { WasteRequestRoutes } from "../modules/wasteRequest/wasteRequest.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { CollectorRoutes } from "../modules/collector/collector.route";
import { InvoiceRoutes } from "../modules/invoice/invoice.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { FeedbackRoutes } from "../modules/feedback/feedback.route";
import { AuditLogRoutes } from "../modules/auditLog/auditLog.route";
import { AnalyticsRoutes } from "../modules/analytics/analytics.route";

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
  {
    path: "/invoices",
    route: InvoiceRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
  {
    path: "/feedbacks",
    route: FeedbackRoutes,
  },
  {
    path: "/audit-logs",
    route: AuditLogRoutes,
  },
  {
    path: "/analytics",
    route: AnalyticsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
