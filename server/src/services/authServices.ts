import User from "../models/userModel";
import { FindUserType, UserInput } from "../types/userTypes";
import { ErrorHandler } from "../utils/errorHandler";
import generateOTP from "../utils/generateOTP";
import { sendVerificationMail, sendVerificationOtp } from "./mailServices";
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

  const existingUser = await User.findOne({ email: userDataJson.email });

  if (existingUser) {
    throw new ErrorHandler("User already exists", 400);
  }

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
