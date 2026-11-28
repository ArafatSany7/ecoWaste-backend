import express, { type Request, type Response } from "express";
import auth from "../../middlewares/auth";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UploadService } from "./upload.service";

const router = express.Router();

router.get(
	"/proof-signature",
	auth("COLLECTOR"),
	catchAsync(async (_req: Request, res: Response) => {
		res.setHeader("Cache-Control", "no-store");
		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Upload signature created",
			data: UploadService.createProofUploadSignature(),
		});
	}),
);

export const UploadRoutes = router;
