import type { RegistrationType } from "./schemas/registration";
import axios from "axios";
import axiosInstance from "./utils/AxiosInstance";
import type { LoginFormType } from "./schemas/logIn";
import type { UpdatePasswordType } from "./schemas/updatePassword";
import type { UsernameType } from "./schemas/username";

export const register = async (formData: RegistrationType) => {
  try {
    const response = await axiosInstance.post("/auth/register", formData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Registration failed";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const login = async (formData: LoginFormType) => {
  try {
    const response = await axiosInstance.post("/auth/login", formData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message = error.response?.data?.message || "Login failed";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message = error.response?.data?.message || "Failed to fetch user";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/auth/users");
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message =
        error.response?.data?.message || "Failed to fetch all users";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const logOut = async () => {
  try {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message = error.response?.data?.message || "Error during sign out";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post("/auth/refresh-token");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message =
        error.response?.data?.message || "Error during refresh Token";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const verifyEmail = async ({
  otp,
  userId,
}: {
  otp: string;
  userId: string;
}) => {
  try {
    const response = await axiosInstance.post("/auth/verify-mail", {
      otp,
      userId,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message =
        error.response?.data?.message || "Error during verifying email";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const sendForgetPasswordLink = async (email: string) => {
  try {
    const response = await axiosInstance.post("/auth/forget-password", {
      email,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message =
        error.response?.data?.message || "Error sending reset password link";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const resetPassword = async (resetData: {
  password: string;
  confirmPassword: string;
  token: string;
}) => {
  try {
    const response = await axiosInstance.post(
      "/auth/reset-password",
      resetData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message = error.response?.data?.message || "Password reset failed";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const checkUsername = async (username: string) => {
  try {
    const response = await axiosInstance.get(
      `/auth/check-username?newUsername=${username}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message =
        error.response?.data?.errors[0].message || "Error checking username";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const updateUsername = async (payload: UsernameType) => {
  try {
    const { username } = payload;
    const response = await axiosInstance.post(`/auth/update-username`, {
      newUsername: username,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message =
        error.response?.data?.errors[0].message || "Error updating username";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const updatePassword = async (updateFields: UpdatePasswordType) => {
  try {
    const response = await axiosInstance.post(
      "/auth/update-password",
      updateFields
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      const message = error.response?.data?.message || "Error updating profile";
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
};
