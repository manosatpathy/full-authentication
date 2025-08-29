interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const rules = [
    {
      label: "A longer password (min. 8 chars.)",
      isValid: password?.length >= 8,
    },
    {
      label: "Upper & lower case letters",
      isValid: /^(?=.*[a-z])(?=.*[A-Z]).*$/.test(password),
    },
    {
      label: "At least one number",
      isValid: /\d/.test(password),
    },
    {
      label: "A symbol (#$&)",
      isValid: /[!@#$%^&]/.test(password),
    },
  ];

  const validRulesCount = rules.filter((rule) => rule.isValid).length;
  const hasMinLength = password?.length >= 8;

  const getStrengthInfo = () => {
    if (!password || password.length === 0) {
      return { level: 0, text: "Enter a password", color: "gray" };
    }
    if (!hasMinLength) {
      return { level: 0, text: "Too short", color: "red" };
    }
    if (validRulesCount === 0) {
      return { level: 1, text: "Very weak", color: "red" };
    }
    if (validRulesCount === 1) {
      return { level: 2, text: "Weak", color: "orange" };
    }
    if (validRulesCount === 2) {
      return { level: 3, text: "Fair", color: "yellow" };
    }
    if (validRulesCount === 3) {
      return { level: 4, text: "Good", color: "blue" };
    }
    return { level: 5, text: "Strong", color: "green" };
  };

  const strengthInfo = getStrengthInfo();

  const getBarColors = (level: number) => {
    const colors = {
      red: "bg-red-500",
      orange: "bg-orange-500",
      yellow: "bg-yellow-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      gray: "bg-gray-200",
    };

    return Array.from({ length: 4 }, (_, index) => {
      if (level === 0) return colors.gray;
      if (index < level)
        return colors[strengthInfo.color as keyof typeof colors];
      return colors.gray;
    });
  };

  const barColors = getBarColors(strengthInfo.level);

  return (
    <div className="space-y-4 p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-200">Password Strength</h3>
          <span
            className={`text-sm font-medium ${
              strengthInfo.color === "red"
                ? "text-red-600"
                : strengthInfo.color === "orange"
                ? "text-orange-600"
                : strengthInfo.color === "yellow"
                ? "text-yellow-600"
                : strengthInfo.color === "blue"
                ? "text-blue-600"
                : strengthInfo.color === "green"
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            {strengthInfo.text}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {barColors.map((color, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${color} `}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-300 font-medium">
          {hasMinLength
            ? "Great! Now make it stronger:"
            : "Must have at least 8 characters"}
        </p>

        <ul className="space-y-2">
          {rules.map((rule, index) => (
            <li
              key={index}
              className={`flex items-center space-x-3 text-sm transition-all duration-200 ${
                rule.isValid ? "text-green-500" : "text-gray-400"
              }`}
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                  rule.isValid ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                {rule.isValid ? (
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
              <span className={rule.isValid ? "font-medium" : ""}>
                {rule.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrength;
