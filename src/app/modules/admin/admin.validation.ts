import { z } from "zod";

const assignCollectorSchema = z.object({
  body: z.object({
    collectorId: z.string({ message: "collectorId is required" }),
  }),
});

const scheduleWasteRequestSchema = z.object({
  body: z.object({
    scheduledDate: z.string({ message: "scheduledDate is required" }),
    timeWindow: z.string({ message: "timeWindow is required" }),
  }),
});

export const AdminValidation = {
  assignCollectorSchema,
  scheduleWasteRequestSchema,
};
