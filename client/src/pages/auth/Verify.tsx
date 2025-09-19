import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import * as apiClient from "../../api-Client";
import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  const { mutate, isPending, error } = useMutation({
    mutationFn: apiClient.verifyUser,
    onSuccess: () => {
      showToast({ message: "Account Created", type: "SUCCESS" });
      navigate("/");
    },
    onError: (error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  useEffect(() => {
    if (token) {
      mutate(token);
    }
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl px-7 py-9 w-full max-w-sm flex flex-col items-center">
        {isPending ? (
          <>
            <svg
              className="animate-spin h-10 w-10 text-teal-500 mb-4"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Verifying your account
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Please wait while we verify your email and activate your account
            </p>
          </>
        ) : error ? (
          <>
            <svg className="h-10 w-10 text-red-500 mb-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.476 2 2 6.486 2 12c0 5.524 4.476 10 10 10s10-4.476 10-10c0-5.514-4.476-10-10-10zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm1-3h-2v2h2v-2zm0-10h-2v8h2V7z"
              />
            </svg>
            <h2 className="text-lg font-medium text-red-600 mb-1">
              Verification Failed
            </h2>
            <p className="text-gray-600 text-center">{error.message}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-4 py-2 rounded bg-teal-500 text-white font-medium shadow hover:bg-teal-600"
            >
              Go Home
            </button>
          </>
        ) : (
          <svg className="h-10 w-10 text-green-500 mb-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M20.285 6.711l-11.285 11.286-5.285-5.286 1.415-1.414 3.869 3.871 9.869-9.872z"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
export default Verify;
