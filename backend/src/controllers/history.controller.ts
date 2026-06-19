import type { Request, Response } from "express";
import { historyService } from "../services/history.service.js";

export class HistoryController {
  async list(req: Request, res: Response) {
    return res.status(200).json(await historyService.listHistory(req.query as Record<string, unknown>));
  }
}

export const historyController = new HistoryController();
