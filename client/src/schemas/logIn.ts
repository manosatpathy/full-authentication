import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .nonempty("Email or Username required")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
      "Password must contain at least one letter and one number"
    ),
});

export type LoginFormType = z.infer<typeof loginSchema>;
