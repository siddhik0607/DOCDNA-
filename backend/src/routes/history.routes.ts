import { Router } from "express";
import { historyController } from "../controllers/history.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { historyQuerySchema } from "../validators/document.validator.js";

export const historyRouter = Router();

historyRouter.get("/", validate(historyQuerySchema, "query"), asyncHandler(historyController.list.bind(historyController)));
