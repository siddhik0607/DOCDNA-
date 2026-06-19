import { z } from "zod";

export const walletNonceSchema = z.object({
  walletAddress: z.string().min(42).max(42),
  email: z.string().email().optional(),
});

export const walletVerifySchema = z.object({
  walletAddress: z.string().min(42).max(42),
  signature: z.string().min(10),
  email: z.string().email().optional(),
});
