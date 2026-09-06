import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { FeedbackValidation } from "./feedback.validation";
import { FeedbackController } from "./feedback.controller";

const router = express.Router();

router.post(
  "/",
  auth("CITIZEN"),
  validateRequest(FeedbackValidation.createFeedbackSchema),
  FeedbackController.createFeedback
);

router.get("/", auth("ADMIN"), FeedbackController.getAllFeedback);

router.get("/my-feedbacks", auth("CITIZEN"), FeedbackController.getMyFeedback);

export const FeedbackRoutes = router;
