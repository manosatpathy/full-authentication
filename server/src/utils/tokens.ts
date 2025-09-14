import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { DecodedToken } from "../types/tokenTypes";
import { ErrorHandler } from "./errorHandler";
import crypto from "crypto";

export const generateAccessToken = (
  userId: Types.ObjectId,
  email: string,
  role: string
) => {
  return jwt.sign({ userId, email, role }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string) => {
  const token = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return { token, expiry };
};

export const generateResetPasswordToken = (
  userId: Types.ObjectId,
  email: string
) => {
  return jwt.sign({ userId, email }, process.env.RESET_PASSWORD_TOKEN_SECRET!, {
    expiresIn: "5m",
  });
};

export const generateDecodedToken = (
  token: string,
  type: "access" | "refresh" | "reset"
): DecodedToken => {
  let secret;

  switch (type) {
    case "access":
      secret = process.env.ACCESS_TOKEN_SECRET;
      break;
    case "refresh":
      secret = process.env.REFRESH_TOKEN_SECRET;
      break;
    case "reset":
      secret = process.env.RESET_PASSWORD_TOKEN_SECRET;
      break;
    default:
      throw new Error("Invalid token type");
  }

  if (!secret) {
    throw new Error(`Missing ${type.toUpperCase()}_TOKEN_SECRET in env`);
  }

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (err: any) {
    throw new ErrorHandler(`Invalid or expired ${type} token`, 401);
  }
};

export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
