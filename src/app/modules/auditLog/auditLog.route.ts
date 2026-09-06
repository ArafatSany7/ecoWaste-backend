import express from "express";
import auth from "../../middlewares/auth";
import { AuditLogController } from "./auditLog.controller";

const router = express.Router();

router.get("/", auth("ADMIN"), AuditLogController.getAllAuditLogs);

router.get("/:id", auth("ADMIN"), AuditLogController.getAuditLogById);

export const AuditLogRoutes = router;
