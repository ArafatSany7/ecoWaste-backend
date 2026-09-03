import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
    firstName: z.string({ required_error: "First name is required" }),
    lastName: z.string({ required_error: "Last name is required" }),
    phone: z.string({ required_error: "Phone number is required" }),
    defaultAddress: z.string({ required_error: "Default address is required" }),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
