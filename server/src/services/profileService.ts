import { ErrorHandler } from "../utils/errorHandler";
import bcrypt from "bcrypt";
import { findUser } from "./authServices";
import User from "../models/userModel";

export const validateCurrentPassword = async (
  currentPassword: string,
  userPassword: string
) => {
  const isPasswordCorrect = await bcrypt.compare(currentPassword, userPassword);
  if (!isPasswordCorrect) {
    throw new ErrorHandler("Current password is incorrect", 401);
  }
};

export const validateAndUpdateUsername = async (
  newUsername: string,
  userId: string
) => {
  const userExist = await findUser({ username: newUsername });

  if (userExist?._id.toString() === userId) {
    return {
      isSame: true,
      available: true,
      message: "This is your current username",
    };
  }

  if (userExist) {
    throw new ErrorHandler("Username already exists", 422);
  }

  await User.findByIdAndUpdate(userId, { username: newUsername });

  return {
    updated: true,
    isSame: false,
    message: "Username updated successfully",
  };
};
