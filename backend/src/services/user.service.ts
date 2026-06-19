import { prisma } from "../database/prisma.js";
import { ApiError } from "../utils/api-error.js";

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  async updateProfile(userId: string, email?: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { email },
    });
  }
}

export const userService = new UserService();
