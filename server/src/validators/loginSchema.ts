import { z } from "zod";
import { isEmail } from "../utils/isEmail";

export const loginSchema = z.object({
  identifier: z
    .string()
    .nonempty("Email or Username required")
    .transform((value) => {
      if (isEmail(value)) {
        return value.toLowerCase().trim();
      }
      return value.trim();
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
