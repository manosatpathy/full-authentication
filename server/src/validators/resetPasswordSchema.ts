import { z } from "zod";

export const resetPasswordParamsSchema = z.object({
  token: z
    .string()
    .min(1, "Token is required")
    .regex(/^[a-f0-9]{64}$/, "Invalid token format"),
});

export const resetPasswordBodySchema = z
  .object({
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
