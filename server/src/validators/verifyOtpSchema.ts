import { z } from "zod";
import { emailSchema, usernameSchema } from "./baseSchema";

export const verifyOtpSchema = z.object({
  identifier: z.union([emailSchema, usernameSchema]),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 characters")
    .regex(/^\d+$/, "OTP must contain only digits"),
});
