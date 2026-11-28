import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
	const result = await NotificationService.getMyNotifications(
		req.user.userId,
		Number(req.query.limit) || 20,
	);
	res.setHeader("Cache-Control", "no-store");
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Notifications retrieved successfully",
		data: result,
	});
});

const markRead = catchAsync(async (req: Request, res: Response) => {
	const result = await NotificationService.markRead(
		req.user.userId,
		String(req.params.id),
	);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Notification marked as read",
		data: result,
	});
});

const markAllRead = catchAsync(async (req: Request, res: Response) => {
	const result = await NotificationService.markAllRead(req.user.userId);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "All notifications marked as read",
		data: result,
	});
});

export const NotificationController = {
	getMyNotifications,
	markRead,
	markAllRead,
};
