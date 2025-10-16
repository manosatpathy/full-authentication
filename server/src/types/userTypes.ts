import { UserType } from "./../models/userModel";

export type Role = "user" | "admin";

export interface UserInput {
  username: string;
  password: string;
  email: string;
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

export type User = {
  id: string;
  email: string;
  username: string;
  role: Role;
};
