import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../api-Client";

type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

export const useLogout = (showToast: (toastMessage: ToastMessage) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.logOut,
    onSuccess: async (data) => {
      showToast({ message: data.message, type: "SUCCESS" });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });
};
