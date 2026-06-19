import { prisma } from "../database/prisma.js";
import { pinataService } from "../ipfs/pinata.service.js";
import type { HashStoreDocument } from "./hashStore.service.js";
import { aiService, type ComparisonResult } from "./ai.service.js";
import { auditService } from "./audit.service.js";

type TamperReportInput = {
  originalDocument: HashStoreDocument;
  uploadedHash: string;
  uploadedBuffer: Buffer;
  uploadedFileName: string;
  uploadedFileType: string;
};

type AuthenticResponse = {
  status: "authentic";
  verification: true;
  trustScore: 100;
  wallet: string | null;
  timestamp: string;
  txHash: string;
  cid: string;
  hash: string;
  qrCode?: string;
};

type TamperResponse = {
  status: "tampered";
  verification: false;
  trustScore: number;
  similarityScore: number;
  changes: Array<{ field: string; oldValue: string; newValue: string }>;
  hash: string;
  originalHash: string;
  modifiedTime: string;
  qrCode?: string;
};

type TamperDependencies = {
  prismaClient: typeof prisma;
  pinata: typeof pinataService;
  ai: typeof aiService;
  audit: typeof auditService;
};

export class TamperDetectionService {
  constructor(
    private readonly deps: TamperDependencies = {
      prismaClient: prisma,
      pinata: pinataService,
      ai: aiService,
      audit: auditService,
    },
  ) {}

  async downloadOriginalFromIPFS(cid: string) {
    return this.deps.pinata.retrieveFromIPFS(cid);
  }

  async compareDocuments(params: {
    originalBuffer: Buffer;
    originalName: string;
    originalType: string;
    uploadedBuffer: Buffer;
    uploadedName: string;
    uploadedType: string;
  }) {
    return this.deps.ai.compareDocuments({
      originalBuffer: params.originalBuffer,
      originalName: params.originalName,
      originalType: params.originalType,
      candidateBuffer: params.uploadedBuffer,
      candidateName: params.uploadedName,
      candidateType: params.uploadedType,
    });
  }

  calculateTrustScore(comparison: ComparisonResult) {
    if (Number.isFinite(comparison.trustScore)) {
      return Math.max(0, Math.min(100, Math.round(comparison.trustScore)));
    }

    const penalty = Math.min(70, comparison.changes.length * 12);
    return Math.max(0, Math.round(comparison.similarityScore - penalty));
  }

  async generateAuthenticResponse(originalDocument: HashStoreDocument, uploadedHash: string): Promise<AuthenticResponse> {
    const prismaDocument = await this.deps.prismaClient.document.findFirst({
      where: {
        fileName: originalDocument.fileName,
        documentHash: originalDocument.hash,
      },
      orderBy: { createdAt: "desc" },
    });

    await this.deps.prismaClient.verificationLog.create({
      data: {
        documentId: prismaDocument?.id,
        status: "AUTHENTIC",
        trustScore: 100,
        verificationTime: new Date(),
      },
    });

    if (prismaDocument) {
      await this.deps.audit.log(prismaDocument.id, "VERIFIED", {
        fileName: originalDocument.fileName,
        storedHash: originalDocument.hash,
        uploadedHash,
      });
    }

    await this.deps.audit.emit("verification_result", {
      documentId: prismaDocument?.id ?? null,
      status: "authentic",
      trustScore: 100,
      hash: uploadedHash,
    });

    return {
      status: "authentic",
      verification: true,
      trustScore: 100,
      wallet: prismaDocument?.ownerWallet ?? null,
      timestamp: originalDocument.timestamp,
      txHash: originalDocument.txHash,
      cid: originalDocument.cid,
      hash: uploadedHash,
      qrCode: originalDocument.qrCode,
    };
  }

  async generateTamperReport(params: TamperReportInput): Promise<TamperResponse> {
    let comparison: ComparisonResult = {
      trustScore: 25,
      similarityScore: 25,
      changes: [
        {
          field: "Document Content",
          oldValue: "Original",
          newValue: "Modified",
        },
      ],
    };

    try {
      if (params.originalDocument.cid) {
        const originalBuffer = await this.downloadOriginalFromIPFS(params.originalDocument.cid);
        comparison = await this.compareDocuments({
          originalBuffer,
          originalName: params.originalDocument.fileName,
          originalType: params.uploadedFileType,
          uploadedBuffer: params.uploadedBuffer,
          uploadedName: params.uploadedFileName,
          uploadedType: params.uploadedFileType,
        });
      }
    } catch (error) {
      console.warn("[TamperDetection] Falling back to default tamper report:", error);
    }

    const trustScore = Math.min(25, this.calculateTrustScore(comparison));
    const modifiedTime = new Date().toISOString();
    const prismaDocument = await this.deps.prismaClient.document.findFirst({
      where: {
        fileName: params.originalDocument.fileName,
        documentHash: params.originalDocument.hash,
      },
      orderBy: { createdAt: "desc" },
    });

    if (prismaDocument) {
      await this.deps.prismaClient.document.update({
        where: { id: prismaDocument.id },
        data: {
          status: "TAMPERED",
          trustScore,
        },
      });
    }

    await this.deps.prismaClient.verificationLog.create({
      data: {
        documentId: prismaDocument?.id,
        status: "TAMPERED",
        trustScore,
        verificationTime: new Date(modifiedTime),
      },
    });

    if (prismaDocument) {
      await this.deps.audit.log(prismaDocument.id, "TAMPER_DETECTED", {
        fileName: params.originalDocument.fileName,
        originalHash: params.originalDocument.hash,
        uploadedHash: params.uploadedHash,
        modifiedTime,
        changes: JSON.parse(JSON.stringify(comparison.changes)) as never,
        trustScore,
        similarityScore: comparison.similarityScore,
      });
      await this.deps.audit.log(prismaDocument.id, "REPORT_GENERATED", {
        fileName: params.originalDocument.fileName,
        modifiedTime,
        changes: JSON.parse(JSON.stringify(comparison.changes)) as never,
        trustScore,
        similarityScore: comparison.similarityScore,
      });
    }
    await this.deps.audit.emit("tamper_detection", {
      documentId: prismaDocument?.id ?? null,
      status: "tampered",
      trustScore,
      modifiedTime,
      changes: comparison.changes,
    });

    return {
      status: "tampered",
      verification: false,
      trustScore,
      similarityScore: comparison.similarityScore,
      changes: comparison.changes,
      hash: params.uploadedHash,
      originalHash: params.originalDocument.hash,
      modifiedTime,
      qrCode: params.originalDocument.qrCode,
    };
  }
}

export const tamperDetectionService = new TamperDetectionService();
