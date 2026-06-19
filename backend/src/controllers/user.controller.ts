import type { Request, Response } from "express";
import type { JwtUser } from "../types/express.js";
import { userService } from "../services/user.service.js";

export class UserController {
  async profile(req: Request, res: Response) {
    const user = (req as Request & { user?: JwtUser }).user!;
    return res.status(200).json(await userService.getProfile(user.userId));
  }

  async updateProfile(req: Request, res: Response) {
    const user = (req as Request & { user?: JwtUser }).user!;
    return res.status(200).json(await userService.updateProfile(user.userId, req.body.email));
  }
}

export const userController = new UserController();
