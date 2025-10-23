import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../api-Client";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

export const useVerifyEmail = () => {
  const { showToast } = useAppContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: apiClient.verifyEmail,
    onSuccess: async () => {
      showToast({ message: "Account Verified!", type: "SUCCESS" });
      localStorage.removeItem("otpExpiry");
      await queryClient.refetchQueries({ queryKey: ["me"], exact: true });
      navigate("/");
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });
};
