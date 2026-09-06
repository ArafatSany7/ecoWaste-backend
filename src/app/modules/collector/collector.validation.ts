import { z } from "zod";

const createCollectorSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    zoneId: z.string(),
  }),
});

const updateAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

const completeCollectionSchema = z.object({
  body: z.object({
    actualWeight: z.number({ message: "actualWeight is required" }).positive(),
    notes: z.string().optional(),
  }),
});

export const CollectorValidation = {
  createCollectorSchema,
  updateAvailabilitySchema,
  completeCollectionSchema,
};
