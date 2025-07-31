import { z } from "zod";

export const verifyMailSchema = z.object({
  otp: z.string().min(4, "OTP must be at least 4 characters"),
  userId: z.string().length(24, "Invalid User ID"),
});
