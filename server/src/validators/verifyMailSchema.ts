import { z } from "zod";

export const verifyMailSchema = z.object({
  token: z.string().length(64, "Invalid verification token"),
});
