import { Types } from "mongoose";
import { transporter } from "../utils/mailHandler";
import { generateResetPasswordToken } from "../utils/tokens";

export interface MailUserPayload {
  _id: Types.ObjectId;
  email: string;
}

export const sendVerificationMail = async (
  user: MailUserPayload,
  otp: string
) => {
  const verificationLink = `http://localhost:5173/auth/verify-otp?userId=${user._id}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user?.email,
    subject: "Welcome to the Authentication Project",
    html: `<p>Welcome to the Authentication Project, Your account has been created with email id: ${user?.email}</p><b>Please verify the email using the OTP ${otp} by clicking this </b><a href="${verificationLink}">Verify</a>`,
  };
  await transporter.sendMail(mailOptions);
};

export const sendForgetPasswordLink = async (user: MailUserPayload) => {
  const token = generateResetPasswordToken(user._id, user.email);
  const resetPasswordLink = `http://localhost:5173/auth/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user?.email,
    subject: "Reset Your Password",
    html: `
      <p>Hello, you requested a password reset</p>
      <a href="${resetPasswordLink}">Click here to reset your password</a>
      <p>This link will expire in 15 minutes.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};
