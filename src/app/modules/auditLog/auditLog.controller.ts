import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuditLogService } from "./auditLog.service";

const getAllAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, actorId, action, entity, entityId, startDate, endDate } = req.query;

  const filters = {
    actorId: actorId as string,
    action: action as string,
    entity: entity as string,
    entityId: entityId as string,
    startDate: startDate as string,
    endDate: endDate as string,
  };

  const parsedPage = page ? parseInt(page as string) : 1;
  const parsedLimit = limit ? parseInt(limit as string) : 10;

  const result = await AuditLogService.getAllAuditLogs(filters, parsedPage, parsedLimit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Audit logs retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAuditLogById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AuditLogService.getAuditLogById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Audit log retrieved successfully",
    data: result,
  });
});

export const AuditLogController = {
  getAllAuditLogs,
  getAuditLogById,
};
