import { NextFunction, Request, Response } from "express";
import {
  createUserAndSendOTP,
  findAllUsers,
  findUser,
  findUserByRefreshToken,
  rotateRefreshToken,
  verifyUserEmail,
} from "../services/authServices";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateDecodedToken,
  generateRefreshToken,
} from "../utils/tokens";
import { ErrorHandler } from "../utils/errorHandler";
import User from "../models/userModel";
import { sendForgetPasswordLink } from "../services/mailServices";
import { clearAuthCookies } from "./../utils/clearAuthCookies";
import { setAuthCookies } from "../utils/setAuthCookies";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password, email, role } = req.body;
  try {
    const savedUser = await createUserAndSendOTP({
      username,
      password,
      email,
      role,
    });
    res.status(201).json({
      error: false,
      message: "User registered",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
        verified: savedUser.email_verified,
      },
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

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      throw new ErrorHandler("User not found", 404);
    }
    clearAuthCookies(res);
    res.status(200).json({ error: false, message: "Logout Successfully!" });
  } catch (error) {
    next(error);
  }
};

export const checkUsernameAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new ErrorHandler("UserId missing in request", 401));
    }

    const { newUsername } = req.body;

    const userExist = await findUser({ username: newUsername });

    if (userExist?._id.toString() === userId) {
      return res.status(200).json({
        available: true,
        isSame: true,
        message: "This is your current username",
        username: newUsername,
      });
    }

    if (userExist) {
      throw new ErrorHandler("username already exist", 422);
    }

    res.status(200).json({
      available: true,
      isSame: false,
      message: "Username is available",
      username: newUsername,
    });
  } catch (error) {
    next(error);
  }
};
