import { z } from "zod";

export const registrationSchema = z
  .object({
    username: z
      .string()
      .min(6, "Username must be at least 6 characters long")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .toLowerCase()
      .trim(),
    email: z.string().email("Invalid Mail Format").toLowerCase().trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
        "Password must contain at least one letter and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
