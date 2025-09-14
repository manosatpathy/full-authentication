import { Types } from "mongoose";
import { transporter } from "../utils/mailHandler";
import { generateResetPasswordToken } from "../utils/tokens";

export const sendVerificationMail = async (email: string, token: string) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${baseUrl.replace(
    /\/+$/,
    ""
  )}/token/${encodeURIComponent(token)}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email for Account creation",
    html: `<p>Welcome to the Authentication Project, To create the account with this email id: ${email}</p><b>Please verify the email by clicking this </b><a href="${verificationLink}">Verify</a>`,
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
