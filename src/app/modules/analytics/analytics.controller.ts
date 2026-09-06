import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AnalyticsService } from "./analytics.service";

const getAdminDashboardMetrics = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getAdminDashboardMetrics();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin dashboard metrics retrieved successfully",
    data: result,
  });
});

export const AnalyticsController = {
  getAdminDashboardMetrics,
};
