import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(6, "Username must be at least 6 characters long")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  )
  .transform((value) => value.trim().toLowerCase());

export const emailSchema = z
  .string()
  .email("Invalid Mail Format")
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
    "Password must contain at least one letter and one number"
  );
