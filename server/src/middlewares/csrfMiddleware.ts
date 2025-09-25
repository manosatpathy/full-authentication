import crypto from "crypto";
import { redisClient } from "../config/redis";
import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";

const generateCsrfToken = async (userId: String, res: Response) => {
  const csrfToken = crypto.randomBytes(32).toString("hex");
  const csrfKey = `csrf:${userId}`;
  await redisClient.set(csrfKey, csrfToken, { EX: 3600 });
  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000,
  });
  return csrfToken;
};

const verifyCsrf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.method === "GET") {
      next();
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ErrorHandler("User not authenticated", 401);
    }

    const clientToken =
      req.headers["x-csrf-token"] ||
      req.headers["x-xsrf-token"] ||
      req.headers["csrf-token"];

    if (!clientToken) {
      throw new ErrorHandler(
        "CSRF Token missing. Please refresh the page.",
        403,
        "CSRF_TOKEN_MISSING"
      );
    }

    const storedToken = await redisClient.get(`csrf:${userId}`);
    if (!storedToken) {
      throw new ErrorHandler(
        "CSRF Token expired. Please try again.",
        403,
        "CSRF_TOKEN_EXPIRED"
      );
    }

    if (storedToken !== clientToken) {
      throw new ErrorHandler(
        "Invalid CSRF Token. Please refresh the page.",
        403,
        "CSRF_TOKEN_INVALID"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
