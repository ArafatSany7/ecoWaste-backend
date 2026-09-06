import { z } from "zod";

const createWasteRequestSchema = z.object({
  body: z.object({
    categoryId: z.string({ message: "Waste category ID is required" }),
    zoneId: z.string({ message: "Service zone ID is required" }),
    address: z.string({ message: "Address is required" }),
    weight: z.number().optional(),
  }),
});

export const WasteRequestValidation = {
  createWasteRequestSchema,
};
