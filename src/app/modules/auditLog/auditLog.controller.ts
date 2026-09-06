import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuditLogService } from "./auditLog.service";

const getAllAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, actorId, action, entity, entityId, startDate, endDate } = req.query;

  const filters = {
    actorId: actorId as unknown as any,
    action: action as unknown as any,
    entity: entity as unknown as any,
    entityId: entityId as unknown as any,
    startDate: startDate as unknown as any,
    endDate: endDate as unknown as any,
  };

  const parsedPage = page ? parseInt(page as unknown as any) : 1;
  const parsedLimit = limit ? parseInt(limit as unknown as any) : 10;

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
