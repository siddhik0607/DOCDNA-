import { randomUUID } from "crypto";
import { ethers } from "ethers";
import { prisma } from "../database/prisma.js";
import type { JwtUser } from "../types/express.js";
import { ApiError } from "../utils/api-error.js";
import { signJwt } from "../utils/jwt.js";

export class AuthService {
  async requestNonce(walletAddress: string, email?: string) {
    const wallet = walletAddress.toLowerCase();
    const user = await prisma.user.upsert({
      where: { walletAddress: wallet },
      update: { email },
      create: { walletAddress: wallet, email },
    });

    const nonce = `Sign this nonce to authenticate with Doc DNA: ${randomUUID()}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.walletNonce.upsert({
      where: { wallet },
      update: { nonce, expiresAt, userId: user.id },
      create: { wallet, nonce, expiresAt, userId: user.id },
    });

    return { nonce, expiresAt: expiresAt.toISOString() };
  }

  async verifyWalletSignature(walletAddress: string, signature: string, email?: string) {
    const wallet = walletAddress.toLowerCase();
    const pending = await prisma.walletNonce.findUnique({ where: { wallet } });
    if (!pending || pending.expiresAt.getTime() < Date.now()) {
      throw new ApiError(401, "Nonce missing or expired. Request a new nonce.");
    }

    const signer = ethers.verifyMessage(pending.nonce, signature).toLowerCase();
    if (signer !== wallet) {
      throw new ApiError(401, "Wallet signature verification failed");
    }

    const user = await prisma.user.upsert({
      where: { walletAddress: wallet },
      update: { email: email ?? undefined },
      create: { walletAddress: wallet, email },
    });

    await prisma.walletNonce.delete({ where: { wallet } });

    const jwtUser: JwtUser = {
      userId: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
    };

    return {
      token: signJwt(jwtUser),
      user: jwtUser,
    };
  }
}

export const authService = new AuthService();
