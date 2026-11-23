import { z } from "zod";
import { latitudeSchema, longitudeSchema } from "../tracking/tracking.validation";

const createWasteRequestSchema = z.object({
  body: z
    .object({
      categoryId: z.string({ message: "Waste category ID is required" }),
      zoneId: z.string({ message: "Service zone ID is required" }),
      address: z.string({ message: "Address is required" }),
      weight: z.number().optional(),
      // Pickup pin on the map. Optional so older clients keep working.
      latitude: latitudeSchema.optional(),
      longitude: longitudeSchema.optional(),
    })
    .refine((b) => (b.latitude == null) === (b.longitude == null), {
      message: "latitude and longitude must be provided together",
      path: ["latitude"],
    }),
});

export const WasteRequestValidation = {
  createWasteRequestSchema,
};
