import { z } from "zod";

const assignCollectorSchema = z.object({
  body: z.object({
    collectorId: z.string({ required_error: "collectorId is required" }),
  }),
});

export const AdminValidation = {
  assignCollectorSchema,
};
