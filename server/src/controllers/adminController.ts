import { NextFunction, Request, Response } from "express";
import { findAllUsers, findUser } from "../services/authServices";
import { ErrorHandler } from "../utils/errorHandler";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await findAllUsers([
      "email",
      "username",
      "email_verified",
      "role",
    ]);
    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!role) {
      throw new ErrorHandler("Role is required", 400);
    }

    const user = await findUser({ id: userId });
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: `User role updated to ${role}` });
  } catch (error) {
    next(error);
  }
};
