import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";
import { Role, User } from "../types/userTypes";
import { redisClient } from "../config/redis";
import { findUser } from "../services/authServices";
import { generateDecodedToken } from "../utils/tokens";
import {
  isSessionActive,
  updateSessionActivity,
} from "../utils/sessionValidator";
import { clearAuthCookies } from "../utils/clearAuthCookies";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any;
      validatedParams?: any;
      user?: User;
      sessionId: string;
    }
  }
}

export const authenticateRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) throw new ErrorHandler("Token Not Found", 401);

    const decoded = generateDecodedToken(token, "access");

    const sessionActive = await isSessionActive({
      userId: decoded.userId,
      sessionId: decoded.sessionId,
    });

    if (!sessionActive) {
      clearAuthCookies(res);
      throw new ErrorHandler(
        "Session Expired. You have been logged in from another device",
        401
      );
    }

    await updateSessionActivity(decoded.sessionId);

    const cachedUser = await redisClient.get(`user:${decoded.userId}`);
    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
      req.sessionId = decoded.sessionId;
      return next();
    }
    const user = await findUser({ id: decoded.userId }, [
      "id",
      "email",
      "username",
      "role",
    ]);
    if (!user) {
      throw new ErrorHandler("Invalid token - user not found", 401);
    }

    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    await redisClient.set(`user:${decoded.userId}`, JSON.stringify(userData), {
      EX: 3600,
    });

    req.user = userData;
    req.sessionId = decoded.sessionId;
    next();
  } catch (err) {
    next(err);
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: You don't have the access" });
      return;
    }
    next();
  };
};
