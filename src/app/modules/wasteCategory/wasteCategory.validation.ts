import { z } from "zod";

const createWasteCategorySchema = z.object({
  body: z.object({
    name: z.string({ message: "Name is required" }),
    type: z.string({ message: "Type is required" }),
    description: z.string().optional(),
  }),
});

const updateWasteCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const WasteCategoryValidation = {
  createWasteCategorySchema,
  updateWasteCategorySchema,
};
