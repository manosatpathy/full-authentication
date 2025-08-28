import { useMutation } from "@tanstack/react-query";
import * as apiClient from "../api-Client";
import { useAppContext } from "@/context/AppContext";

export const useResendOtp = (setTimeLeft: (t: number) => void) => {
  const { showToast } = useAppContext();

  return useMutation({
    mutationFn: apiClient.resendEmailVerificationMail,
    onSuccess: (data) => {
      showToast({
        message: "Resent Email verification link!",
        type: "SUCCESS",
      });
      setTimeLeft(
        Math.max(
          0,
          Math.floor((new Date(data.otpExpiry).getTime() - Date.now()) / 1000)
        )
      );
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });
};
