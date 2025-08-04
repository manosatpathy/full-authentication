import { z } from "zod";

export const checkUsernameSchema = z.object({
  newUsername: z
    .string()
    .nonempty("Username is required")
    .min(6, "Username must be at least 6 characters long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .trim()
    .toLowerCase(),
});
