import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    defaultAddress: z.string(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
