import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { WasteRequestService } from "./wasteRequest.service";

const createWasteRequest = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await WasteRequestService.createWasteRequest(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Waste request created successfully",
    data: result,
  });
});

const getAllWasteRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await WasteRequestService.getAllWasteRequests(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Waste requests retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyWasteRequests = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await WasteRequestService.getMyWasteRequests(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Your waste requests retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getWasteRequestById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = { userId: req.user.userId, role: req.user.role };
  const result = await WasteRequestService.getWasteRequestById(id, user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Waste request retrieved successfully",
    data: result,
  });
});

export const WasteRequestController = {
  createWasteRequest,
  getAllWasteRequests,
  getMyWasteRequests,
  getWasteRequestById,
};
