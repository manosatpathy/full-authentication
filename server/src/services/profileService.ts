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

export const checkUsernameAvailability = async (
  username: string,
  userId: string
) => {
  const userExist = await findUser({ username });

  if (userExist?._id.toString() === userId) {
    return {
      available: true,
      isSame: true,
      message: "This is your current username",
    };
  }

  if (userExist) {
    return {
      available: false,
      isSame: false,
      message: "Username already exists",
    };
  }

  return {
    available: true,
    isSame: false,
    message: "Username is available",
  };
};

export const validateAndUpdateUsername = async (
  newUsername: string,
  userId: string
) => {
  const availabilityCheck = await checkUsernameAvailability(
    newUsername,
    userId
  );

  if (availabilityCheck.isSame) {
    return {
      updated: false,
      isSame: true,
      available: true,
      message: availabilityCheck.message,
    };
  }

  if (!availabilityCheck.available) {
    throw new ErrorHandler("Username already exists", 422);
  }

  await User.findByIdAndUpdate(userId, { username: newUsername });

  return {
    updated: true,
    isSame: false,
    available: true,
    message: "Username updated successfully",
  };
};
