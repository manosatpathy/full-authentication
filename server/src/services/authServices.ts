import { Types } from "mongoose";
import User, { UserType } from "../models/userModel";
import { FindUserType, UserInput } from "../types/userTypes";
import { ErrorHandler } from "../utils/errorHandler";
import generateOTP from "../utils/generateOTP";
import { sendVerificationMail, sendVerificationOtp } from "./mailServices";
import bcrypt from "bcrypt";
import { generateRandomToken } from "../utils/tokens";
import { redisClient } from "../config/redis";

export const findUser = async (
  { id, email, username }: FindUserType,
  selectedFields?: string[]
) => {
  const orConditions = [];

  if (id) orConditions.push({ _id: id });
  if (email) orConditions.push({ email });
  if (username) orConditions.push({ username });

  if (orConditions.length === 0) return null;

  const query = User.findOne({ $or: orConditions });

  if (selectedFields && selectedFields.length > 0) {
    query.select(selectedFields.join(" "));
  }

  return await query;
};

export const findAllUsers = async (selectedFields?: string[]) => {
  const query = User.find();

  if (selectedFields && selectedFields.length > 0) {
    query.select(selectedFields.join(" "));
  }

  return await query;
};

export const sendSignupVerification = async ({
  username,
  email,
  password,
}: UserInput) => {
  let user = await findUser({ email, username });
  if (user) throw new ErrorHandler("User already exists", 400);

  const token = generateRandomToken();
  const verifyKey = `verify:${token}`;
  const dataToStore = JSON.stringify({ username, email, password });

  await redisClient.set(verifyKey, dataToStore, { EX: 300 });

  await sendVerificationMail(email, token);
  return { token, success: true };
};

export const verifyUserEmail = async (token: string) => {
  const verifyKey = `verify:${token}`;

  const userData = await redisClient.get(verifyKey);
  if (!userData) {
    throw new ErrorHandler("Verification Link is expired", 400);
  }

  await redisClient.del(verifyKey);

  const userDataJson = JSON.parse(userData);

  const newUser = new User({
    username: userDataJson.username,
    email: userDataJson.email,
    password: userDataJson.password,
  });
  await newUser.save();
};

export const sendLoginVerification = async (email: string) => {
  const otp = generateOTP();
  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, otp, { EX: 300 });

  await sendVerificationOtp(email, otp);
};

export const findUserByRefreshToken = async (
  userId: string,
  refreshToken: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new ErrorHandler("User not found", 404);

  const tokenDoc = user.refreshTokens.find((t) => t.token === refreshToken);
  if (!tokenDoc) throw new ErrorHandler("Invalid refresh token", 403);

  if (!tokenDoc.expiresAt || tokenDoc.expiresAt.getTime() < Date.now()) {
    throw new ErrorHandler("Refresh token expired", 403);
  }

  return user;
};

export const rotateRefreshToken = (
  user: any,
  oldToken: string,
  newToken: string,
  expiry: Date
) => {
  user.refreshTokens.pull({ token: oldToken });
  user.refreshTokens.push({ token: newToken, expiresAt: expiry });
};

export const sendVerificationOTP = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }
  if (user.email_verified) {
    throw new ErrorHandler("Email already verified", 400);
  }

  await setOTPAndSendMail(user);
  await user.save();

  return {
    message: "Verification email sent successfully",
    otpExpiry: user.otpExpires,
  };
};
