import { UserType } from "./../models/userModel";

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

export type UpdateFields = {
  user: UserType;
  newPassword: string;
};
