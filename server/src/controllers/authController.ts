import { NextFunction, Request, Response } from "express";
import {
  findUser,
  findUserByRefreshToken,
  rotateRefreshToken,
  sendSignupVerification,
  sendVerificationOTP,
  verifyUserEmail,
} from "../services/authServices";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateDecodedToken,
  generateRefreshToken,
} from "../utils/tokens";
import { ErrorHandler } from "../utils/errorHandler";
import { clearAuthCookies } from "./../utils/clearAuthCookies";
import { setAuthCookies } from "../utils/setAuthCookies";
import User from "../models/userModel";
import { redisClient } from "./../config/redis";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password, email } = req.body;
  try {
    const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;
    if (await redisClient.get(rateLimitKey)) {
      throw new ErrorHandler("Too many request, try again later.", 429);
    }
    await sendSignupVerification({
      username,
      email,
      password,
    });
    await redisClient.set(rateLimitKey, "true", { EX: 60 });
    res.status(200).json({
      error: false,
      message:
        "A verification link has been sent to your Email. It will expire in 5 minutes.",
    });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { identifier, password } = req.body;
  try {
    let user = await findUser({ email: identifier, username: identifier });
    if (!user) {
      throw new ErrorHandler("Username or Email does not exist", 401);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ErrorHandler("Invalid Credentials", 401);
    }

    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const { token: refreshToken, expiry } = generateRefreshToken(
      user._id.toString()
    );

    user.refreshTokens.push({ token: refreshToken, expiresAt: expiry });
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      error: false,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new ErrorHandler("Refresh Token not found", 401);
  }

  try {
    const decoded = generateDecodedToken(refreshToken, "refresh");
    const user = await findUserByRefreshToken(decoded.userId, refreshToken);

    const { token: newRefreshToken, expiry } = generateRefreshToken(
      user._id.toString()
    );

    rotateRefreshToken(user, refreshToken, newRefreshToken, expiry);
    await user.save();

    const accessToken = generateAccessToken(user._id, user.email, user.role);

    setAuthCookies(res, accessToken, newRefreshToken);

    res.status(200).json({ accessToken, message: "Token rotated" });
  } catch (error) {
    next(error);
  }
};

export const verifyMailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp, userId } = req.body;

  try {
    await verifyUserEmail(otp, userId);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;
  const userId = req.user?.userId;
  try {
    if (!userId) {
      throw new ErrorHandler("User not found", 404);
    }
    await User.findByIdAndDelete(userId, {
      $pull: { refreshTokens: { token: refreshToken } },
    });
    clearAuthCookies(res);
    res.status(200).json({ error: false, message: "Logout Successfully!" });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    const data = await sendVerificationOTP(userId!);

    res.status(200).json({
      error: false,
      message: data.message,
      otpExpiry: data.otpExpiry,
    });
  } catch (err) {
    next(err);
  }
};
