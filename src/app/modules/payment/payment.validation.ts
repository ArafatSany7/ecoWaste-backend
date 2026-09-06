import { z } from "zod";

const initiatePaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string({ required_error: "invoiceId is required" }),
  }),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string({ required_error: "paymentId is required" }),
  }),
});

export const PaymentValidation = {
  initiatePaymentSchema,
  verifyPaymentSchema,
};
