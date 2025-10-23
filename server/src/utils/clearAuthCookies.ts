import { Response } from "express";

export const clearAuthCookies = (res: Response) => {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = isProduction ? ".manosatpathy.in" : undefined;

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    domain,
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    domain,
  });

  res.clearCookie("csrfToken", {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    domain,
  });
};
