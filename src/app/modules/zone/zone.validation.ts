import { z } from "zod";

const createZoneSchema = z.object({
  body: z.object({
    name: z.string({ message: "Zone name is required" }),
    city: z.string({ message: "City is required" }),
  }),
});

const updateZoneSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    city: z.string().optional(),
  }),
});

export const ZoneValidation = {
  createZoneSchema,
  updateZoneSchema,
};
