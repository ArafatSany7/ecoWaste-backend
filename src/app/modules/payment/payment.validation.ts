import { z } from "zod";

const initiatePaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string({ message: "invoiceId is required" }),
  }),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string({ message: "paymentId is required" }),
  }),
});

export const PaymentValidation = {
  initiatePaymentSchema,
  verifyPaymentSchema,
};
