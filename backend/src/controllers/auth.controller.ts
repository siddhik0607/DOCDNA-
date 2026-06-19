import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";

export class AuthController {
  async requestNonce(req: Request, res: Response) {
    return res.status(200).json(await authService.requestNonce(req.body.walletAddress, req.body.email));
  }

  async verifyWallet(req: Request, res: Response) {
    return res
      .status(200)
      .json(await authService.verifyWalletSignature(req.body.walletAddress, req.body.signature, req.body.email));
  }

  async logout(_req: Request, res: Response) {
    return res.status(200).json({ message: "Logged out successfully" });
  }
}

export const authController = new AuthController();
