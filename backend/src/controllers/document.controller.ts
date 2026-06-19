import type { Request, Response } from "express";
import type { JwtUser } from "../types/express.js";
import { ApiError } from "../utils/api-error.js";
import { documentService } from "../services/document.service.js";
import { hashStoreService } from "../services/hashStore.service.js";

export class DocumentController {
  async upload(req: Request, res: Response) {
    if (!req.file) {
      throw new ApiError(400, "Document file is required");
    }

    const user = (req as Request & { user?: JwtUser }).user;
    if (!user) {
      throw new ApiError(401, "Unauthenticated request");
    }

    return res.status(200).json(
      await documentService.uploadDocument({
        buffer: req.file.buffer,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        walletAddress: user.walletAddress,
      }),
    );
  }

  async verify(req: Request, res: Response) {
    if (!req.file) {
      throw new ApiError(400, "Document file is required");
    }

    const user = (req as Request & { user?: JwtUser }).user;
    if (!user) {
      throw new ApiError(401, "Unauthenticated request");
    }

    return res.status(200).json(
      await documentService.verifyDocument({
        buffer: req.file.buffer,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        walletAddress: user.walletAddress,
      }),
    );
  }

  async details(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const document = await hashStoreService.findDocumentById(id);
    if (!document) {
      throw new ApiError(404, "Document not found");
    }

    return res.status(200).json(document);
  }
}

export const documentController = new DocumentController();
