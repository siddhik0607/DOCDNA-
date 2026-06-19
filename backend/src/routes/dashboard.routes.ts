import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", asyncHandler(dashboardController.stats.bind(dashboardController)));
dashboardRouter.get("/trends", asyncHandler(dashboardController.trends.bind(dashboardController)));
dashboardRouter.get("/recent", asyncHandler(dashboardController.recent.bind(dashboardController)));
