import { blockchainService } from "../blockchain/blockchain.service.js";
import { prisma } from "../database/prisma.js";
import { pinataService } from "../ipfs/pinata.service.js";
import { sha256 } from "../utils/hash.js";
import { auditService } from "./audit.service.js";
import { dnaService } from "./dna.service.js";
import { hashStoreService } from "./hashStore.service.js";
import { tamperDetectionService } from "./tamperDetection.service.js";

export class DocumentService {
  async uploadDocument(params: {
    buffer: Buffer;
    fileName: string;
    fileType: string;
    walletAddress: string;
  }) {
    const ownerWallet = params.walletAddress.toLowerCase();
    const documentHash = sha256(params.buffer);

    await auditService.emit("upload_progress", {
      stage: "hash_generated",
      fileName: params.fileName,
      hash: documentHash,
    });

    const originalDocument = await hashStoreService.findDocumentByName(params.fileName);
    if (!originalDocument) {
      return this.registerDocument({
        buffer: params.buffer,
        fileName: params.fileName,
        fileType: params.fileType,
        ownerWallet,
        documentHash,
      });
    }

    const verification = await hashStoreService.verifyDocument(params.fileName, documentHash);
    if (verification.found && verification.status === "authentic") {
      return tamperDetectionService.generateAuthenticResponse(originalDocument, documentHash);
    }

    return tamperDetectionService.generateTamperReport({
      originalDocument,
      uploadedHash: documentHash,
      uploadedBuffer: params.buffer,
      uploadedFileName: params.fileName,
      uploadedFileType: params.fileType,
    });
  }

  async verifyDocument(params: { buffer: Buffer; fileName: string; fileType: string; walletAddress: string }) {
    const documentHash = sha256(params.buffer);
    const wallet = params.walletAddress.toLowerCase();

    const verification = await hashStoreService.verifyDocument(params.fileName, documentHash);
    if (verification.found) {
      if (verification.status === "authentic") {
        return tamperDetectionService.generateAuthenticResponse(verification.document, documentHash);
      }
      return tamperDetectionService.generateTamperReport({
        originalDocument: verification.document,
        uploadedHash: documentHash,
        uploadedBuffer: params.buffer,
        uploadedFileName: params.fileName,
        uploadedFileType: params.fileType,
      });
    }

    console.info("[Verification] Stored Hash:", "not_found");
    console.info("[Verification] New Hash:", documentHash);
    console.info("[Verification] Comparison Result:", "not_found");
    console.info("[Verification] Status Returned:", "not_found");

    await prisma.verificationLog.create({
      data: {
        status: "NOT_FOUND",
        trustScore: 0,
        verificationTime: new Date(),
      },
    });

    return {
      status: "not_found",
      verification: false,
      trustScore: 0,
      hash: documentHash,
    };
  }

  private async registerDocument(params: {
    buffer: Buffer;
    fileName: string;
    fileType: string;
    ownerWallet: string;
    documentHash: string;
  }) {
    const ipfs = await pinataService.uploadToIPFS(params.buffer, params.fileName, params.fileType);
    await auditService.emit("upload_progress", { stage: "ipfs_stored", cid: ipfs.cid, fileName: params.fileName });

    const chain = await blockchainService.registerDocumentOnChain(params.documentHash, ipfs.cid, params.ownerWallet);
    await auditService.emit("blockchain_confirmation", {
      txHash: chain.txHash,
      blockNumber: chain.blockNumber,
      fileName: params.fileName,
    });

    const dna = dnaService.generate(params.documentHash);
    const owner = await prisma.user.findUnique({ where: { walletAddress: params.ownerWallet } });

    const document = await prisma.$transaction(
      async (tx: { document: typeof prisma.document; documentVersion: typeof prisma.documentVersion }) => {
        const created = await tx.document.create({
          data: {
            fileName: params.fileName,
            fileType: params.fileType,
            documentHash: params.documentHash,
            ipfsCid: ipfs.cid,
            gatewayUrl: ipfs.gatewayUrl,
            ownerWallet: params.ownerWallet,
            blockchainTxHash: chain.txHash,
            blockchainTimestamp: new Date(chain.timestamp),
            documentDna: dna,
            status: "REGISTERED",
            trustScore: 100,
            ownerId: owner?.id,
          },
        });

        await tx.documentVersion.create({
          data: {
            documentId: created.id,
            versionNumber: 1,
            documentHash: params.documentHash,
            ipfsCid: ipfs.cid,
          },
        });

        return created;
      },
    );

    await auditService.log(document.id, "UPLOADED", { hash: params.documentHash, fileName: params.fileName });
    await auditService.log(document.id, "IPFS_STORED", {
      cid: ipfs.cid,
      gatewayUrl: ipfs.gatewayUrl,
      timestamp: ipfs.timestamp,
      metadata: JSON.parse(JSON.stringify(ipfs.metadata)) as never,
    });
    await auditService.log(document.id, "BLOCKCHAIN_REGISTERED", {
      txHash: chain.txHash,
      blockNumber: chain.blockNumber,
      wallet: chain.wallet,
      timestamp: chain.timestamp,
    });
    await auditService.log(document.id, "DNA_GENERATED", { dna });
    await auditService.emit("dashboard_update", { documentId: document.id, status: "registered" });
    const createdAt = new Date().toISOString();
    await hashStoreService.addDocument({
      id: document.id,
      fileName: params.fileName,
      hash: params.documentHash,
      cid: ipfs.cid,
      wallet: params.ownerWallet,
      txHash: chain.txHash,
      timestamp: chain.timestamp,
      createdAt,
      status: "authentic",
      events: [
        { at: createdAt, label: "Verified Document" },
        { at: createdAt, label: "Blockchain Registered" },
        { at: createdAt, label: "IPFS Stored" },
      ],
    });

    return {
      status: "registered",
      hash: params.documentHash,
      cid: ipfs.cid,
      txHash: chain.txHash,
      wallet: params.ownerWallet,
      timestamp: chain.timestamp,
      dna,
    };
  }
}

export const documentService = new DocumentService();
