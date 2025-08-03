import { z } from "zod";

export const editProfileSchema = z
  .object({
    username: z.string().nonempty("Username is required"),
    currentPassword: z.string().nonempty("Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
        "Password must contain at least one letter and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type EditProfileType = z.infer<typeof editProfileSchema>;
