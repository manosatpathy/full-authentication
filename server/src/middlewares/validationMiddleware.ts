import { RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";

type RequestDataSource = "body" | "query" | "params";

export const validateRequest = (
  schema: ZodSchema,
  source: RequestDataSource = "body"
): RequestHandler => {
  return async (req, res, next) => {
    try {
      const result = await schema.parseAsync(req[source]);

      if (source === "body") {
        req[source] = result;
      } else if (source === "query") {
        (req as any).validatedQuery = result;
      } else if (source === "params") {
        (req as any).validatedParams = result;
      }

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
