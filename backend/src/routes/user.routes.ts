import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { updateProfileSchema } from "../validators/user.validator.js";

export const userRouter = Router();

userRouter.get("/profile", requireAuth, asyncHandler(userController.profile.bind(userController)));
userRouter.put("/profile", requireAuth, validate(updateProfileSchema), asyncHandler(userController.updateProfile.bind(userController)));
