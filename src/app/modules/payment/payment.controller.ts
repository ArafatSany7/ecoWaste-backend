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

const bkashCallback = catchAsync(async (req: Request, res: Response) => {
  const { paymentID, status } = req.query;
  const ipAddress = req.ip;

  if (!paymentID || !status) {
    return res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: red;">Invalid Payment Request</h1>
        <p>You can close this window.</p>
      </div>
    `);
  }

  const result = await PaymentService.bkashCallback(
    paymentID as string,
    status as string,
    ipAddress
  );

  if (result.success) {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: green;">Payment Successful!</h1>
        <p>Your invoice has been marked as PAID.</p>
        <p>You can close this window.</p>
      </div>
    `);
  } else {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: red;">Payment Failed or Cancelled!</h1>
        <p>Please try again from the app.</p>
        <p>You can close this window.</p>
      </div>
    `);
  }
});

export const PaymentController = {
  initiatePayment,
  verifyPayment,
  bkashCallback,
};
