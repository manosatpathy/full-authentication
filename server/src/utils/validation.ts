import { UpdateFields } from "../types/userTypes";
import { ErrorHandler } from "./errorHandler";

export const validateUpdateRequest = (
  newUsername?: string,
  newPassword?: string
) => {
  if (!newUsername && !newPassword) {
    throw new ErrorHandler(
      "At least new username or new password must be provided.",
      400
    );
  }
};

export const updateUserFields = ({
  user,
  newUsername,
  newPassword,
}: UpdateFields) => {
  const updates = { usernameUpdated: false, passwordUpdated: false };

  if (newUsername) {
    user.username = newUsername;
    updates.usernameUpdated = true;
  }

  if (newPassword) {
    user.password = newPassword;
    updates.passwordUpdated = true;
  }

  return updates;
};
