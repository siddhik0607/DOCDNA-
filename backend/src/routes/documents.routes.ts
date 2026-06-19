import { Router } from "express";
import { documentController } from "../controllers/document.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { asyncHandler } from "../utils/async-handler.js";

export const documentsRouter = Router();

documentsRouter.post("/upload", requireAuth, upload.single("document"), asyncHandler(documentController.upload.bind(documentController)));
documentsRouter.post("/verify", requireAuth, upload.single("document"), asyncHandler(documentController.verify.bind(documentController)));
documentsRouter.get("/:id", asyncHandler(documentController.details.bind(documentController)));
