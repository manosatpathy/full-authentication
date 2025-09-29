import { redisClient } from "../config/redis";
import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";

export const verifyCsrf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    const storedToken = await redisClient.get(`csrfKey:${userId}`);

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
