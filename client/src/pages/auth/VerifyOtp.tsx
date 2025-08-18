import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { SiAuthelia } from "react-icons/si";
import * as apiClient from "../../api-Client";
import { useAppContext } from "@/context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyOTP = () => {
  const [otpFields, setOtpFields] = useState<string[]>(new Array(6).fill(""));
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const queryClient = useQueryClient();

  const inputRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const key = e.key;
    if (key === "ArrowLeft") {
      inputRef.current[index - 1]?.focus();
    }
    if (key === "ArrowRight") {
      inputRef.current[index + 1]?.focus();
    }

    if (key === "Backspace") {
      const copyOtpFields = [...otpFields];
      if (copyOtpFields[index] === "") {
        copyOtpFields[index - 1] = "";
        setOtpFields(copyOtpFields);
        inputRef.current[index - 1]?.focus();
      } else {
        copyOtpFields[index] = "";
        setOtpFields(copyOtpFields);
      }
      return;
    }

    if (key === "Delete") {
      const copyOtpFields = [...otpFields];
      if (copyOtpFields[index] === "") {
        if (index < otpFields.length - 1) {
          copyOtpFields[index + 1] = "";
          setOtpFields(copyOtpFields);
          inputRef.current[index + 1]?.focus();
        }
      } else {
        copyOtpFields[index] = "";
        setOtpFields(copyOtpFields);
      }
      return;
    }
  };

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) {
      const pastedChars = value.slice(0, 6);
      const newOtpFields = [...otpFields];

      for (let i = 0; i < pastedChars.length && index + i < 6; i++) {
        if (!isNaN(Number(pastedChars[i]))) {
          newOtpFields[index + i] = pastedChars[i];
        }
      }

      setOtpFields(newOtpFields);

      const nextIndex = Math.min(index + pastedChars.length, 5);
      inputRef.current[nextIndex]?.focus();
    } else if (value.length <= 1 && (value === "" || !isNaN(Number(value)))) {
      const newOtpFields = [...otpFields];
      newOtpFields[index] = value;
      setOtpFields(newOtpFields);

      if (value && index < 5) {
        inputRef.current[index + 1]?.focus();
      }
    }
  };
  useEffect(() => {
    inputRef.current[0]?.focus();
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: apiClient.verifyEmail,
    onSuccess: async () => {
      showToast({ message: "Email Verified!", type: "SUCCESS" });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/");
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const onSubmit = ({
    otp,
    userId,
  }: {
    otp: string;
    userId: string | null;
  }) => {
    if (!userId) {
      showToast({ message: "User ID is missing", type: "ERROR" });
      return;
    }
    mutate({ otp, userId });
  };

  return (
    <div className="flex  flex-col items-center gap-4">
      <SiAuthelia className="text-5xl" />
      <h1 className="text-2xl font-bold mb-10">Verify Email By OTP</h1>

      <div className="flex flex-col gap-5 items-center">
        <div>
          {otpFields.map((value, index) => (
            <input
              type="text"
              key={index}
              value={value}
              maxLength={6}
              ref={(currentInput: HTMLInputElement | null) => {
                inputRef.current[index] = currentInput;
              }}
              className="h-14 w-14 p-0.5 m-3 outline text-center rounded-2xl bg-slate-50"
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>
        <button
          className="border py-3 px-5 bg-slate-700 hover:bg-slate-600 cursor-pointer text-white rounded-2xl"
          onClick={() =>
            onSubmit({ otp: otpFields.join("").toString(), userId })
          }
          disabled={isPending}
        >
          Verify Email OTP
        </button>
        <div>Please introduce the 6 digit code we sent via email.</div>
      </div>
    </div>
  );
};

export default VerifyOTP;
