import { useEffect } from "react";

type ToastProps = {
  message: string;
  type: "SUCCESS" | "ERROR";
  onClose: () => void;
};

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const baseStyles =
    "fixed bottom-6 right-9 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 transition-all duration-300 ease-in-out max-w-sm";

  const successStyles = "bg-green-100 text-green-800 border border-green-300";
  const errorStyles = "bg-red-100 text-red-800 border border-red-300";

  const icon =
    type === "SUCCESS" ? (
      <svg
        className="w-6 h-6 text-green-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg
        className="w-6 h-6 text-red-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );

  return (
    <div
      className={`${baseStyles} ${
        type === "SUCCESS" ? successStyles : errorStyles
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default Toast;
