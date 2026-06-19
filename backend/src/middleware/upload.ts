import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { MAX_UPLOAD_SIZE_BYTES, SUPPORTED_MIME_TYPES } from "../config/constants.js";
import { ApiError } from "../utils/api-error.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter: (_req: Request, file: { mimetype: string }, callback: FileFilterCallback) => {
    if (!SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
      callback(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
      return;
    }
    callback(null, true);
  },
});
