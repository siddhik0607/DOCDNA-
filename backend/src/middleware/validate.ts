import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validate(schema: ZodSchema, target: "body" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[target]);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    req[target] = parsed.data;
    return next();
  };
}
