import { z } from "zod";

const assignCollectorSchema = z.object({
  body: z.object({
    collectorId: z.string({ required_error: "collectorId is required" }),
  }),
});

const scheduleWasteRequestSchema = z.object({
  body: z.object({
    scheduledDate: z.string({ required_error: "scheduledDate is required" }),
    timeWindow: z.string({ required_error: "timeWindow is required" }),
  }),
});

export const AdminValidation = {
  assignCollectorSchema,
  scheduleWasteRequestSchema,
};
