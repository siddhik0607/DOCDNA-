import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtUser } from "../types/express.js";

export function signJwt(user: JwtUser): string {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: "12h" });
}

export function verifyJwt(token: string): JwtUser {
  return jwt.verify(token, env.JWT_SECRET) as JwtUser;
}
