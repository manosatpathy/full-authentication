import { transporter } from "../utils/mailHandler";

export const sendVerificationMail = async (email: string, token: string) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${baseUrl.replace(
    /\/+$/,
    ""
  )}/auth/verify/${encodeURIComponent(token)}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email for Account creation",
    html: `<p>Welcome to the Authentication Project, To create the account with this email id: ${email}</p><b>Please verify the email by clicking this </b><a href="${verificationLink}">Verify</a>`,
  };
  await transporter.sendMail(mailOptions);
};

export const sendVerificationOtp = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP for Login verification",
    html: `
      <p>Welcome to the Authentication Project!</p>
      <p>Your OTP for login verification is:</p>
      <h2 style="color: #007bff; font-size: 24px; letter-spacing: 2px;">${otp}</h2>
      <p><b>This OTP will expire in 5 minutes.</b></p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordMail = async (email: string, token: string) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${baseUrl.replace(
    /\/+$/,
    ""
  )}/auth/reset-password/${encodeURIComponent(token)}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <a href="${resetLink}"
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">For security reasons, this link can only be used once.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
