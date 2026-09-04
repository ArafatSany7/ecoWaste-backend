import { z } from "zod";

const createWasteRequestSchema = z.object({
  body: z.object({
    categoryId: z.string({ required_error: "Waste category ID is required" }),
    zoneId: z.string({ required_error: "Service zone ID is required" }),
    address: z.string({ required_error: "Address is required" }),
    weight: z.number().optional(),
  }),
});

export const WasteRequestValidation = {
  createWasteRequestSchema,
};
