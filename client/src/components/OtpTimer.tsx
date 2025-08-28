interface Props {
  timeLeft: number;
  onResend: () => void;
}

const OtpTimer = ({ timeLeft, onResend }: Props) => {
  return (
    <div className="text-gray-300 text-sm">
      {timeLeft > 0 ? (
        <>
          OTP expires in{" "}
          <span className="font-bold">
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}s
          </span>
        </>
      ) : (
        <button
          className="text-blue-400 underline cursor-pointer"
          onClick={onResend}
        >
          Resend OTP
        </button>
      )}
    </div>
  );
};

export default OtpTimer;
