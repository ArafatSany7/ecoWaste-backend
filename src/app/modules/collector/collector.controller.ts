import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CollectorService } from "./collector.service";

const getAllCollectors = catchAsync(async (req: Request, res: Response) => {
  const result = await CollectorService.getAllCollectors();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Collectors retrieved successfully",
    data: result,
  });
});

const getCollectorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CollectorService.getCollectorById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Collector retrieved successfully",
    data: result,
  });
});

const toggleAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { isAvailable } = req.body;
  const result = await CollectorService.toggleAvailability(userId, isAvailable);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Availability updated to ${isAvailable ? "Available" : "Unavailable"}`,
    data: result,
  });
});

const getMyJobs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await CollectorService.getMyJobs(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Jobs retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const CollectorController = {
  getAllCollectors,
  getCollectorById,
  toggleAvailability,
  getMyJobs,
};
