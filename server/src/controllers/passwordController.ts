import { NextFunction, Request, Response } from "express";
import { findUser } from "../services/authServices";
import { ErrorHandler } from "../utils/errorHandler";
import { sendForgetPasswordLink } from "../services/mailServices";
import { generateDecodedToken } from "../utils/tokens";
import { validateCurrentPassword } from "../services/profileService";

export const forgetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  try {
    const user = await findUser({ email });
    if (!user) {
      throw new ErrorHandler("Email does not exist", 401);
    }

    await sendForgetPasswordLink(user);
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
  const { password, token } = req.body;

  const decoded = generateDecodedToken(token, "reset");
  const userId = decoded?.userId;

  try {
    const user = await findUser({ id: userId });
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }
    user.password = password;
    await user.save();
    res
      .status(201)
      .json({ error: false, message: "Password Reset Successful" });
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
    const userId = req.user?.userId;
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
