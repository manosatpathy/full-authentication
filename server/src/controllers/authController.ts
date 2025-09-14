import { NextFunction, Request, Response } from "express";
import {
  findUser,
  findUserByRefreshToken,
  rotateRefreshToken,
  sendLoginVerification,
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

export const verifyUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.body;
  try {
    if (!token) {
      throw new ErrorHandler("verification token is required", 400);
    }

    await verifyUserEmail(token);
    res.status(201).json({ message: "User Registered successfully" });
  } catch (error) {
    next(error);
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
    const rateLimitKey = `login-rate-limit:${req.ip}:${user.email}`;
    if (await redisClient.get(rateLimitKey)) {
      throw new ErrorHandler("Too many request", 429);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ErrorHandler("Invalid Credentials", 401);
    }

    await sendLoginVerification(user.email);

    await redisClient.set(rateLimitKey, "true", { EX: 60 });

    res.status(200).json({
      error: false,
      message: "Verification OTP has been sent. It will be valid for 5 min",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identifier, otp } = req.body;
    let user = await findUser({ email: identifier, username: identifier });
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    const otpKey = `otp:${user?.email}`;
    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp) {
      throw new ErrorHandler("OTP expired", 400);
    }

    if (otp !== storedOtp) {
      throw new ErrorHandler("Invalid OTP", 400);
    }

    await redisClient.del(otpKey);

    const accessToken = generateAccessToken(user?._id.toString());
    const refreshToken = generateRefreshToken(user?._id.toString());

    const refreshKey = `refreshKey:${user?._id}`;
    await redisClient.set(refreshKey, refreshToken, { EX: 7 * 24 * 60 * 60 });

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: `Welcome ${user?.username}`,
      user,
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
