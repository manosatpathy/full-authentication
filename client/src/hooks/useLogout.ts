import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../api-Client";
import { type NavigateFunction } from "react-router-dom";

type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

export const useLogout = (
  showToast: (toastMessage: ToastMessage) => void,
  navigate: NavigateFunction
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.logOut,
    onSuccess: async (data) => {
      showToast({ message: data.message, type: "SUCCESS" });
      queryClient.setQueryData(["me"], null);
      navigate("/");
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });
};
