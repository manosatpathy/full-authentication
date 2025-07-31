import { Types } from "mongoose";

export interface UserPayload {
  _id: Types.ObjectId;
  username: string;
  password: string;
  email: string;
  email_verified: boolean;
  refreshToken?: string | null | undefined;
  otp?: string | null | undefined;
}

export type Role = "user" | "admin";

export interface UserInput {
  username: string;
  password: string;
  email: string;
  role?: Role;
}

export type FindUserType = {
  id?: string;
  email?: string;
  username?: string;
};
