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

  const result = await AdminService.rejectWasteRequest(id, adminId, ipAddress);

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

export const AdminController = {
  approveWasteRequest,
  rejectWasteRequest,
  createCollector,
  assignCollector,
};
