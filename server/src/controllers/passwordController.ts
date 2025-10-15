import { NextFunction, Request, Response } from "express";
import { findUser, sendResetPasswordLink } from "../services/authServices";
import { ErrorHandler } from "../utils/errorHandler";
import { validateCurrentPassword } from "../services/profileService";
import { redisClient } from "../config/redis";
import bcrypt from "bcrypt";
import User from "../models/userModel";

export const forgetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  try {
    const rateLimitKey = `forgot-password-rate-limit:${req.ip}:${email}`;
    if (await redisClient.get(rateLimitKey)) {
      throw new ErrorHandler("Too many requests. Please try again later.", 429);
    }

    const user = await findUser({ email });
    if (!user) {
      throw new ErrorHandler("Email does not exist", 401);
    }

    await sendResetPasswordLink(email, user.id);

    await redisClient.set(rateLimitKey, "true", { EX: 60 });

    res.status(201).json({
      error: false,
      message: "Link has been sent!",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.validatedParams;
  const { password } = req.body;

  try {
    const resetKey = `password-reset:${token}`;
    const data = await redisClient.get(resetKey);

    if (!data) {
      throw new ErrorHandler("Invalid or expired reset link", 400);
    }

    const { userId, email } = JSON.parse(data);

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    await redisClient.del(resetKey);

    const activeSessionId = await redisClient.get(`active_session:${userId}`);

    const keysToDelete = [
      `active_session:${userId}`,
      `refreshKey:${userId}`,
      `csrfKey:${userId}`,
      `user:${userId}`,
    ];

    if (activeSessionId) {
      keysToDelete.push(`session:${activeSessionId}`);
    }

    await Promise.all(keysToDelete.map((key) => redisClient.del(key)));

    res.status(200).json({
      error: false,
      message:
        "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const user = await findUser({ id: userId });

    if (!userId || !user) {
      throw new ErrorHandler("User not found", 404);
    }
    const { currentPassword, newPassword } = req.body;

    await validateCurrentPassword(currentPassword, user.password);
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password Changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
