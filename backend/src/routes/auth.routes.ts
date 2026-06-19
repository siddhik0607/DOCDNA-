import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { walletNonceSchema, walletVerifySchema } from "../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post("/nonce", validate(walletNonceSchema), asyncHandler(authController.requestNonce.bind(authController)));
authRouter.post("/wallet", validate(walletVerifySchema), asyncHandler(authController.verifyWallet.bind(authController)));
authRouter.post("/logout", asyncHandler(authController.logout.bind(authController)));
