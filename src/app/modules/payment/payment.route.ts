import express from "express";
import auth from "../../middlewares/auth";
import { PaymentController } from "./payment.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";

const router = express.Router();

router.post(
  "/initiate",
  auth("CITIZEN"),
  validateRequest(PaymentValidation.initiatePaymentSchema),
  PaymentController.initiatePayment
);

router.post(
  "/verify",
  auth("CITIZEN"),
  validateRequest(PaymentValidation.verifyPaymentSchema),
  PaymentController.verifyPayment
);


router.get("/callback", PaymentController.bkashCallback);

export const PaymentRoutes = router;
