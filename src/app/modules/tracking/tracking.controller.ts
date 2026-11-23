import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TrackingService } from "./tracking.service";

const updateMyLocation = catchAsync(async (req: Request, res: Response) => {
	const result = await TrackingService.updateCollectorLocation(
		req.user.userId,
		req.body,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Location updated",
		data: result,
	});
});

const getRequestTracking = catchAsync(async (req: Request, res: Response) => {
	const result = await TrackingService.getRequestTracking(
		String(req.params.id),
		{
			userId: req.user.userId,
			role: req.user.role,
		},
	);

	// Live data: never let a CDN or browser cache it.
	res.setHeader("Cache-Control", "no-store");
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Tracking retrieved successfully",
		data: result,
	});
});

export const TrackingController = {
	updateMyLocation,
	getRequestTracking,
};
