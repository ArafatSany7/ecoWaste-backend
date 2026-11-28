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

const rejectWasteRequestSchema = z.object({
  body: z.object({
    reason: z.string({ message: "A reason is required" }).trim().min(3, "Reason must be at least 3 characters").max(300),
  }),
});

export const AdminValidation = {
  rejectWasteRequestSchema,
  assignCollectorSchema,
  scheduleWasteRequestSchema,
};
