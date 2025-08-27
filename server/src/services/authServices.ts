import { Types } from "mongoose";
import User, { UserType } from "../models/userModel";
import { FindUserType, UserInput } from "../types/userTypes";
import { ErrorHandler } from "../utils/errorHandler";
import generateOTP from "../utils/generateOTP";
import { sendVerificationMail } from "./mailServices";
import bcrypt from "bcrypt";

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

const setOTPAndSendMail = async (user: UserType & { _id: Types.ObjectId }) => {
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 1000 * 60 * 10);

  user.otp = otp;
  user.otpExpires = otpExpires;

  await sendVerificationMail(user, otp);
  return user;
};

export const createUserAndSendOTP = async ({
  username,
  password,
  email,
  role,
}: UserInput) => {
  let user = await findUser({ email, username });
  if (user) throw new ErrorHandler("User already exists", 400);

  const newUser = new User({ username, password, email, role });
  await setOTPAndSendMail(newUser.toObject());
  const savedUser = await newUser.save();

  return savedUser;
};

export const verifyUserEmail = async (otp: string, userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  if (!user.otp || !user.otpExpires || user.otpExpires.getTime() < Date.now()) {
    throw new ErrorHandler("OTP has expired or is invalid", 400);
  }

  const isMatch = await bcrypt.compare(otp, user.otp as string);
  if (!isMatch) {
    throw new ErrorHandler("OTP does not match", 401);
  }

  user.email_verified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return;
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
