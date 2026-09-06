import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FeedbackService } from "./feedback.service";

const createFeedback = catchAsync(async (req: Request, res: Response) => {
  const citizenId = req.user.userId;
  const result = await FeedbackService.createFeedback(citizenId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Feedback submitted successfully",
    data: result,
  });
});

const getAllFeedback = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.getAllFeedback();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedback retrieved successfully",
    data: result,
  });
});

const getMyFeedback = catchAsync(async (req: Request, res: Response) => {
  const citizenId = req.user.userId;
  const result = await FeedbackService.getMyFeedback(citizenId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Your feedback retrieved successfully",
    data: result,
  });
});

export const FeedbackController = {
  createFeedback,
  getAllFeedback,
  getMyFeedback,
};
