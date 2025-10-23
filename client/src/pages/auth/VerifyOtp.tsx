import { useEffect, useState } from "react";
import { SiAuthelia } from "react-icons/si";
import OtpInputs from "../../components/OtpInputs";
import OtpTimer from "../../components/OtpTimer";
import { useVerifyEmail } from "../../hooks/useVerifyEmail";
import { useResendOtp } from "../../hooks/useResendOtp";

const VerifyOTP = () => {
  const [otpFields, setOtpFields] = useState(new Array(6).fill(""));

  const getTimeLeft = () => {
    const otpExpiry = localStorage.getItem("otpExpiry");
    if (!otpExpiry) return 0;

    const expiryTime = new Date(otpExpiry).getTime();
    return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    if (timeLeft <= 0) {
      localStorage.removeItem("otpExpiry");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("otpExpiry");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const { mutate: verify, isPending } = useVerifyEmail();
  const { mutate: resendLink } = useResendOtp(setTimeLeft);

  const onSubmit = () => {
    verify({ otp: otpFields.join("") });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <SiAuthelia className="text-5xl" />
      <h1 className="text-2xl font-bold mb-7">Verify Your Account</h1>

      <div className="flex flex-col gap-5 items-center">
        <OtpInputs
          otpFields={otpFields}
          setOtpFields={setOtpFields}
          disabled={timeLeft <= 0}
        />

        <button
          onClick={onSubmit}
          disabled={isPending || timeLeft <= 0}
          className={`border py-3 px-5 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl
          ${
            isPending || timeLeft <= 0
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
        >
          Verify OTP
        </button>

        <OtpTimer timeLeft={timeLeft} onResend={() => resendLink()} />
        <div>Please introduce the 6 digit code we sent via email.</div>
      </div>
    </div>
  );
};

export default VerifyOTP;
