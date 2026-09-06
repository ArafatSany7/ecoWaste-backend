import { z } from "zod";

const createFeedbackSchema = z.object({
  body: z.object({
    requestId: z.string({ required_error: "requestId is required" }),
    rating: z
      .number({ required_error: "rating is required" })
      .min(1, "rating must be at least 1")
      .max(5, "rating must be at most 5"),
    comment: z.string().optional(),
  }),
});

export const FeedbackValidation = {
  createFeedbackSchema,
};
