import { z } from "zod";
import { emailSchema, passwordSchema, usernameSchema } from "./baseSchema";

export const loginSchema = z.object({
  identifier: z.union([usernameSchema, emailSchema]),
  password: passwordSchema,
});
