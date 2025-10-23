import { z } from "zod";

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 characters")
    .regex(/^\d+$/, "OTP must contain only digits"),
});
