import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";

export class DashboardController {
  async stats(_req: Request, res: Response) {
    return res.status(200).json(await dashboardService.getStats());
  }

  async trends(_req: Request, res: Response) {
    return res.status(200).json(await dashboardService.getTrends());
  }

  async recent(_req: Request, res: Response) {
    return res.status(200).json(await dashboardService.getRecent());
  }
}

export const dashboardController = new DashboardController();
