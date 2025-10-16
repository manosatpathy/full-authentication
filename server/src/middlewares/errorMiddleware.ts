import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
): any => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    code: error.code,
  });
};
