import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  ALCHEMY_RPC_URL: z.string().url(),
  PRIVATE_KEY: z.string().min(1),
  CONTRACT_ADDRESS: z.string().min(1),
  PINATA_JWT: z.string().min(1),
  PINATA_GATEWAY: z.string().min(1),
  AI_SERVICE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default("*"),
});

export const env = envSchema.parse(process.env);
