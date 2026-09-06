import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email format"),
    password: z.string({ message: "Password is required" }).min(6, "Password must be at least 6 characters"),
    firstName: z.string({ message: "First name is required" }),
    lastName: z.string({ message: "Last name is required" }),
    phone: z.string({ message: "Phone number is required" }),
    defaultAddress: z.string({ message: "Default address is required" }),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email format"),
    password: z.string({ message: "Password is required" }),
  }),
});

const googleLoginValidationSchema = z.object({
  body: z.object({
    idToken: z.string({ message: "idToken is required" }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  googleLoginValidationSchema,
};
