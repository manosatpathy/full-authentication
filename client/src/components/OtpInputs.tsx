import { useRef } from "react";

interface Props {
  otpFields: string[];
  setOtpFields: (fields: string[]) => void;
  disabled: boolean;
}

const OtpInputs = ({ otpFields, setOtpFields, disabled }: Props) => {
  const inputRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const key = e.key;
    if (key === "ArrowLeft") inputRef.current[index - 1]?.focus();
    if (key === "ArrowRight") inputRef.current[index + 1]?.focus();

    if (key === "Backspace" || key === "Delete") {
      const copy = [...otpFields];
      copy[index] = "";
      setOtpFields(copy);
      if (key === "Backspace" && index > 0)
        inputRef.current[index - 1]?.focus();
      if (key === "Delete" && index < otpFields.length - 1)
        inputRef.current[index + 1]?.focus();
    }
  };

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) {
      const pastedChars = value.slice(0, 6);
      const newOtpFields = [...otpFields];
      for (let i = 0; i < pastedChars.length && index + i < 6; i++) {
        if (!isNaN(Number(pastedChars[i])))
          newOtpFields[index + i] = pastedChars[i];
      }
      setOtpFields(newOtpFields);
      inputRef.current[Math.min(index + pastedChars.length, 5)]?.focus();
    } else {
      const newOtpFields = [...otpFields];
      newOtpFields[index] = value;
      setOtpFields(newOtpFields);
      if (value && index < 5) inputRef.current[index + 1]?.focus();
    }
  };

  return (
    <div>
      {otpFields.map((value, index) => (
        <input
          key={index}
          type="text"
          value={value}
          maxLength={6}
          ref={(el) => {
            inputRef.current[index] = el;
          }}
          disabled={disabled}
          className="h-14 w-14 p-0.5 m-3 outline text-center rounded-2xl bg-slate-50 text-black"
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        />
      ))}
    </div>
  );
};

export default OtpInputs;
