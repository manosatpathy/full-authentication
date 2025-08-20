import { NextFunction, Request, Response } from "express";
import { findUser } from "../services/authServices";
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
  const userId = req.user?.userId;

  try {
    const user = await findUser({ id: userId }, [
      "email",
      "username",
      "email_verified",
      "role",
    ]);
    if (!user) {
      throw new ErrorHandler("User with id not found", 404);
    }
    res.status(200).json({
      message: "User fetched success",
      data: user,
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
    const userId = req.user?.userId;
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
    const userId = req.user?.userId;
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
