import prisma from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { createBkashPayment, executeBkashPayment } from "../../lib/bkash";

const initiatePayment = async (invoiceId: string, citizenId: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new AppError(404, "Invoice not found");
  }

  if (invoice.citizenId !== citizenId) {
    throw new AppError(403, "You are not authorized to pay this invoice");
  }

  if (invoice.status !== "PENDING") {
    throw new AppError(400, "Invoice is already paid or cancelled");
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount: invoice.amount,
      provider: "BKASH",
      status: "INITIATED",
    },
  });

  // Real bKash gateway implementation
  const bkashResponse = await createBkashPayment(invoiceId, invoice.amount);

  // Update payment with bkash response data
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      transactionId: bkashResponse.paymentID, // Using paymentID to track initially
    },
  });

  return bkashResponse;
};

const verifyPayment = async (paymentId: string, citizenId: string, ipAddress?: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: true },
  });

  if (!payment) {
    throw new AppError(404, "Payment record not found");
  }

  if (payment.invoice.citizenId !== citizenId) {
    throw new AppError(403, "You are not authorized to verify this payment");
  }

  if (payment.status !== "INITIATED") {
    throw new AppError(400, `Payment is already ${payment.status}`);
  }

  // Real bKash Execute Payment
  const bkashVerification = await executeBkashPayment(payment.transactionId as string);

  if (bkashVerification.statusCode !== "0000" || bkashVerification.transactionStatus !== "Completed") {
    // Optionally update payment status to FAILED here
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "FAILED" },
    });
    throw new AppError(400, `bKash payment failed: ${bkashVerification.statusMessage}`);
  }

  const transactionId = bkashVerification.trxID;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update Payment Status
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "SUCCESS",
        transactionId,
      },
    });

    // 2. Update Invoice Status
    await tx.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: "PAID" },
    });

    // 3. Create AuditLog
    await tx.auditLog.create({
      data: {
        actorId: citizenId,
        action: "PAYMENT_SUCCESS",
        entity: "Invoice",
        entityId: payment.invoiceId,
        previousValue: { paymentStatus: "PENDING", paymentId },
        newValue: { paymentStatus: "PAID", transactionId },
        ipAddress: ipAddress || null,
      },
    });

    return updatedPayment;
  });

  return result;
};

export const PaymentService = {
  initiatePayment,
  verifyPayment,
};
