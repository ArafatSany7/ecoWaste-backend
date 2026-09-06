import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { InvoiceService } from "./invoice.service";

const getMyInvoices = catchAsync(async (req: Request, res: Response) => {
  const citizenId = req.user.userId;
  const result = await InvoiceService.getMyInvoices(citizenId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invoices retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const InvoiceController = {
  getMyInvoices,
};
