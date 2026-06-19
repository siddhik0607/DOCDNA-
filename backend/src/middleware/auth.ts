import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { verifyJwt } from "../utils/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing bearer token"));
  }

  try {
    const token = header.slice("Bearer ".length);
    (req as Request & { user?: unknown }).user = verifyJwt(token);
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}
