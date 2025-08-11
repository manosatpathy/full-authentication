import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";
import { generateDecodedToken } from "../utils/tokens";
import { DecodedToken } from "../types/tokenTypes";
import { Role } from "../types/userTypes";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any;
      validatedParams?: any;
      user?: DecodedToken;
    }
  }
}

export const verifyToken =
  (type: "access" | "reset") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
      if (!token) throw new ErrorHandler("Token Not Found", 401);
      const decoded = generateDecodedToken(token, type);
      req.user = decoded;
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
