import { z } from "zod";

export const updatePasswordSchema = z
  .object({
    newUsername: z
      .string()
      .min(6, "Username must be at least 6 characters long")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .trim()
      .toLowerCase()
      .optional(),
    currentPassword: z
      .string()
      .nonempty("Current Password is required")
      .min(8, "Current Password must be at least 8 characters long"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
        "Password must contain at least one letter and one number"
      )
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword) {
        return (
          data.confirmPassword && data.newPassword === data.confirmPassword
        );
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );
