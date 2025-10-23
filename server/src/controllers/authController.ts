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
  generateRandomToken,
  generateTokens,
} from "../utils/tokens";
import { ErrorHandler } from "../utils/errorHandler";
import { clearAuthCookies } from "./../utils/clearAuthCookies";
import { setAuthCookies } from "../utils/setAuthCookies";
import { redisClient } from "./../config/redis";
import { updateSessionActivity } from "../utils/sessionValidator";

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

    const verificationKey = `pending-verification:${user.id}`;
    const verificationData = JSON.stringify({
      email: user.email,
      userId: user.id,
    });
    await redisClient.set(verificationKey, verificationData, { EX: 600 });

    await sendLoginVerification(user.email);
    await redisClient.set(rateLimitKey, "true", { EX: 60 });

    res.cookie("v_s", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 10 * 60 * 1000,
    });

    res.status(200).json({
      error: false,
      message: "Verification OTP has been sent. It will be valid for 5 min",
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
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
    const { otp } = req.body;
    const verificationSessionId = req.cookies.v_s;

    if (!verificationSessionId) {
      throw new ErrorHandler(
        "Verification session expired. Please login again.",
        401
      );
    }

    const verificationKey = `pending-verification:${verificationSessionId}`;
    const verificationSessionData = await redisClient.get(verificationKey);

    if (!verificationSessionData) {
      throw new ErrorHandler(
        "Verification session expired. Please login again.",
        401
      );
    }

    const { email, userId } = JSON.parse(verificationSessionData);

    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp) {
      throw new ErrorHandler("OTP expired", 400);
    }

    if (otp !== storedOtp) {
      throw new ErrorHandler("Invalid OTP", 400);
    }

    const user = await findUser({ id: userId }, [
      "id",
      "username",
      "email",
      "role",
    ]);

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    await Promise.all([
      redisClient.del(otpKey),
      redisClient.del(verificationKey),
    ]);

    res.clearCookie("v_s", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    const activeSessionKey = `active_session:${user._id}`;
    const existingSession = await redisClient.getDel(activeSessionKey);

    if (existingSession) {
      await Promise.all([
        redisClient.del(`session:${existingSession}`),
        redisClient.del(`refreshKey:${user._id}`),
      ]);
    }

    const sessionId = generateRandomToken();
    const { accessToken, refreshToken, csrfToken } = generateTokens(
      user._id.toString(),
      sessionId
    );

    const sessionData = {
      userId: user._id,
      sessionId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    const sessionDataKey = `session:${sessionId}`;
    const refreshTokenKey = `refreshKey:${user._id}`;
    const csrfTokenKey = `csrfKey:${user._id}`;

    await Promise.all([
      redisClient.set(refreshTokenKey, refreshToken, {
        EX: 7 * 24 * 60 * 60,
      }),
      redisClient.set(activeSessionKey, sessionId, {
        EX: 7 * 24 * 60 * 60,
      }),
      redisClient.set(sessionDataKey, JSON.stringify(sessionData), {
        EX: 7 * 24 * 60 * 60,
      }),
      redisClient.set(csrfTokenKey, csrfToken, { EX: 3600 }),
    ]);

    setAuthCookies(res, accessToken, refreshToken, csrfToken);

    res.status(200).json({
      message: `Welcome ${user.username}`,
      user,
      sessionInfo: {
        sessionId,
        loginTime: new Date().toISOString(),
        csrfToken,
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
  const refreshToken = req.cookies.refreshToken;

  try {
    if (!refreshToken) {
      throw new ErrorHandler(
        "Refresh Token not found",
        401,
        "REFRESH_TOKEN_MISSING"
      );
    }

    const decoded = generateDecodedToken(refreshToken, "refresh");

    const storedToken = await redisClient.get(`refreshKey:${decoded.userId}`);
    if (!storedToken) {
      throw new ErrorHandler(
        "Refresh token expired. Please log in again",
        401,
        "REFRESH_TOKEN_EXPIRED"
      );
    }

    const activeSessionId = await redisClient.get(
      `active_session:${decoded.userId}`
    );

    if (!activeSessionId) {
      throw new ErrorHandler(
        "Session not found. Please log in again",
        401,
        "SESSION_NOT_FOUND"
      );
    }

    if (storedToken !== refreshToken || decoded.sessionId !== activeSessionId) {
      throw new ErrorHandler(
        "Session invalidated. You may have logged in from another device",
        401,
        "SESSION_INVALIDATED"
      );
    }

    await updateSessionActivity(activeSessionId);

    const accessToken = generateAccessToken(decoded.userId, decoded.sessionId);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const activeSessionId = await redisClient.get(`active_session:${userId}`);

    await Promise.all([
      redisClient.del(`active_session:${userId}`),
      redisClient.del(`refreshKey:${userId}`),
      redisClient.del(`csrfKey:${userId}`),
      redisClient.del(`user:${userId}`),
      activeSessionId
        ? redisClient.del(`session:${activeSessionId}`)
        : Promise.resolve(),
    ]);

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
    const newCsrfToken = generateCsrfToken();
    await redisClient.set(csrfKey, newCsrfToken, { EX: 3600 });

    res.cookie("csrfToken", newCsrfToken, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

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
    const verificationSessionId = req.cookies.v_s;

    if (!verificationSessionId) {
      throw new ErrorHandler(
        "Verification session expired. Please login again.",
        401
      );
    }

    const verificationKey = `pending-verification:${verificationSessionId}`;
    const sessionData = await redisClient.get(verificationKey);

    if (!sessionData) {
      throw new ErrorHandler(
        "Verification session expired. Please login again.",
        401
      );
    }

    const { email, userId } = JSON.parse(sessionData);

    const resendRateLimitKey = `resend-otp:${userId}`;
    if (await redisClient.get(resendRateLimitKey)) {
      throw new ErrorHandler(
        "Please wait 60 seconds before requesting a new OTP",
        429
      );
    }

    await sendLoginVerification(email);
    await redisClient.set(resendRateLimitKey, "true", { EX: 60 });

    res.status(200).json({
      error: false,
      message: "Verification OTP has been resent",
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    next(err);
  }
};
