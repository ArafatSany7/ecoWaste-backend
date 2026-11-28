import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const approveWasteRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.user.userId;
  const ipAddress = req.ip;

  const result = await AdminService.approveWasteRequest(id, adminId, ipAddress);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Waste request approved successfully",
    data: result,
  });
});

const rejectWasteRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.user.userId;
  const ipAddress = req.ip;

  const result = await AdminService.rejectWasteRequest(String(id), adminId, ipAddress, req.body?.reason);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Waste request rejected successfully",
    data: result,
  });
});

const createCollector = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createCollector(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Collector created successfully",
    data: result,
  });
});

const assignCollector = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.user.userId;
  const ipAddress = req.ip;

  const result = await AdminService.assignCollector(id, req.body, adminId, ipAddress);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Collector assigned successfully",
    data: result,
  });
});

const scheduleWasteRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.user.userId;
  const ipAddress = req.ip;

  const result = await AdminService.scheduleWasteRequest(id, req.body, adminId, ipAddress);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Waste request scheduled successfully",
    data: result,
  });
});

const acceptWasteRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.acceptWasteRequest(String(req.params.id), req.user.userId, req.ip);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Request accepted and collector assigned",
    data: result,
  });
});

const verifyCompletion = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.verifyCompletion(String(req.params.id), req.user.userId, req.ip);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pickup verified and invoice created",
    data: result,
  });
});

export const AdminController = {
  acceptWasteRequest,
  verifyCompletion,
  approveWasteRequest,
  rejectWasteRequest,
  createCollector,
  assignCollector,
  scheduleWasteRequest,
};
