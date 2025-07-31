import { RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateRequest = (schema: ZodSchema): RequestHandler => {
  return async (req, res, next) => {
    try {
      const result = await schema.parseAsync(req.body);
      req.body = result;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          status: "fail",
          errors: err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      } else {
        next(err);
      }
    }
  };
};
