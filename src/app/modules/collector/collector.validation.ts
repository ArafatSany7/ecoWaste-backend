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

const markCollectedSchema = z.object({
  body: z.object({
    actualWeight: z.number({ message: "actualWeight is required" }).positive(),
    notes: z.string().trim().max(500).optional(),
    photoUrls: z.array(z.url()).min(1, "Add at least one proof photo").max(3, "Up to 3 photos"),
  }),
});

export const CollectorValidation = {
  createCollectorSchema,
  updateAvailabilitySchema,
  markCollectedSchema,
};
