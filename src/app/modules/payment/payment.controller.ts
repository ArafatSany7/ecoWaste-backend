import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const citizenId = req.user.userId;
  const { invoiceId } = req.body;

  const result = await PaymentService.initiatePayment(invoiceId, citizenId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const citizenId = req.user.userId;
  const { paymentId } = req.body;
  const ipAddress = req.ip;

  const result = await PaymentService.verifyPayment(paymentId, citizenId, ipAddress);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment verified successfully",
    data: result,
  });
});

export const PaymentController = {
  initiatePayment,
  verifyPayment,
};
