import { NextFunction, Request, Response } from "express";
import {
  findUser,
  sendLoginVerification,
  sendSignupVerification,
  verifyUserEmail,
} from "../services/authServices";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateCsrfToken,
  generateDecodedToken,
  generateTokens,
} from "../utils/tokens";
import { ErrorHandler } from "../utils/errorHandler";
import { clearAuthCookies } from "./../utils/clearAuthCookies";
import { setAuthCookies } from "../utils/setAuthCookies";
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
  const { token } = req.validatedParams;
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

export const verifyOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identifier, otp } = req.body;
    let user = await findUser({ email: identifier, username: identifier }, [
      "id",
      "username",
      "email",
      "role",
    ]);
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

    const { accessToken, refreshToken, csrfToken } = generateTokens(
      user?._id.toString()
    );

    const refreshKey = `refreshKey:${user?._id}`;
    const csrfKey = `csrfKey:${user?._id}`;
    await redisClient.set(refreshKey, refreshToken, { EX: 7 * 24 * 60 * 60 });
    await redisClient.set(csrfKey, csrfToken, { EX: 3600 });

    setAuthCookies(res, accessToken, refreshToken, csrfToken);

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
  const refreshToken = req.cookies.refreshToken;

  try {
    if (!refreshToken) {
      throw new ErrorHandler("Refresh Token not found", 401);
    }

    const decoded = generateDecodedToken(refreshToken, "refresh");

    const storedToken = await redisClient.get(`refreshKey:${decoded.userId}`);
    if (storedToken !== refreshToken) {
      throw new ErrorHandler("Token Expired", 401);
    }

    const accessToken = generateAccessToken(decoded.userId);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  try {
    if (!userId) {
      throw new ErrorHandler("User not authenticated", 401);
    }

    await redisClient.del(`refreshKey:${userId}`);
    await redisClient.del(`csrfKey:${userId}`);
    await redisClient.del(`user:${userId}`);

    clearAuthCookies(res);

    res.status(200).json({ error: false, message: "Logout Successfully!" });
  } catch (error) {
    next(error);
  }
};

export const refreshCsrfController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ErrorHandler("User not authenticated", 401);
    }

    const csrfKey = `csrfKey:${userId}`;

    await redisClient.del(csrfKey);

    const newCsrfToken = generateCsrfToken();

    await redisClient.set(csrfKey, newCsrfToken, { EX: 3600 });
    res.json({
      message: "CSRF token refreshed successfully",
      csrfToken: newCsrfToken,
    });
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
