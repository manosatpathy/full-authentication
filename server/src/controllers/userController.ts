import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";
import {
  checkUsernameAvailability,
  validateAndUpdateUsername,
} from "../services/profileService";

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    res.status(200).json({
      message: "User fetched success",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const checkUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ErrorHandler("User not found", 401);
    }

    const username = req.validatedQuery?.newUsername;
    const result = await checkUsernameAvailability(username, userId);

    res.status(200).json({
      available: result.available,
      isSame: result.isSame,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ErrorHandler("User not found", 401);
    }

    const { newUsername } = req.body;
    const result = await validateAndUpdateUsername(newUsername, userId);

    res.status(200).json({
      updated: result.updated,
      available: result.available,
      isSame: result.isSame,
      message: result.message,
      username: newUsername,
    });
  } catch (error) {
    next(error);
  }
};
