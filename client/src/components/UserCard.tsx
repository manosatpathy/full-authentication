import { Card, CardContent } from "@/components/ui/card";
import { RxAvatar } from "react-icons/rx";
import { useAppContext } from "@/context/AppContext";
import { useMutation } from "@tanstack/react-query";
import * as apiClient from "../api-Client";
import { useNavigate } from "react-router-dom";

const UserCard = () => {
  const { user, showToast } = useAppContext();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: apiClient.resendEmailVerificationMail,
    onSuccess: (data) => {
      showToast({ message: "Email verification link send!", type: "SUCCESS" });
      navigate(`/auth/verify-otp?userId=${user?._id}`, {
        state: { otpExpires: data.otpExpiry },
      });
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const verifyNow = () => {
    mutate();
  };

  return (
    <Card className="w-full max-w-sm max-h-[510px] rounded-2xl shadow-xl border-none bg-gradient-to-br from-white via-gray-50 to-blue-100">
      <CardContent className="flex flex-col justify-center items-center gap-10 p-8">
        <div className="flex flex-col gap-3 justify-center items-center">
          <div className="rounded-full bg-gradient-to-tr from-blue-400 via-blue-300 to-purple-300 p-2 shadow-lg mb-2">
            <RxAvatar size={70} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 tracking-wide">
            {user?.username}
          </h3>
          <h4 className="text-sm font-medium text-blue-600 uppercase tracking-widest">
            {user?.role}
          </h4>
        </div>
        <div className="flex flex-col justify-center items-center w-full gap-1">
          <p className="text-gray-600">{user?.email}</p>
          {user?.email_verified ? (
            <p className="text-green-600 font-semibold text-xs bg-green-50 px-2 py-1 rounded-full mt-1">
              Verified
            </p>
          ) : (
            <button
              onClick={verifyNow}
              disabled={isPending}
              className={`font-semibold text-xs bg-red-50 px-2 py-1 rounded-full mt-1 transition 
    ${
      isPending
        ? "text-red-400"
        : "text-red-600 hover:bg-red-100 cursor-pointer"
    }`}
            >
              Verify now
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
