import jwt from "jsonwebtoken";
import crypto from "crypto";
import { DecodedToken } from "../types/tokenTypes";
import { ErrorHandler } from "./errorHandler";

export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateAccessToken = (userId: string, sessionId: string) => {
  return jwt.sign({ userId, sessionId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string, sessionId: string) => {
  return jwt.sign(
    { userId, sessionId },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
};

export const generateCsrfToken = () => {
  const csrfToken = generateRandomToken();
  return csrfToken;
};

export const generateTokens = (userId: string, sessionId: string) => {
  const accessToken = generateAccessToken(userId, sessionId);
  const refreshToken = generateRefreshToken(userId, sessionId);
  const csrfToken = generateCsrfToken();
  return { accessToken, refreshToken, csrfToken };
};

export const generateDecodedToken = (
  token: string,
  type: "access" | "refresh"
): DecodedToken => {
  let secret;
  if (type === "access") {
    secret = process.env.ACCESS_TOKEN_SECRET;
  } else if (type === "refresh") {
    secret = process.env.REFRESH_TOKEN_SECRET;
  }

  if (!secret) {
    throw new Error(`Missing ${type.toUpperCase()}_TOKEN_SECRET in env`);
  }

  try {
    const decoded = jwt.verify(token, secret as string) as DecodedToken;
    return decoded;
  } catch (error) {
    throw new ErrorHandler(
      `Invalid or expired ${type} token`,
      401,
      "REFRESH_TOKEN_INVALID"
    );
  }
};
