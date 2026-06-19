import { mkdir, readFile, writeFile } from "fs/promises";
import crypto from "crypto";
import path from "path";
import { qrService } from "./qr.service.js";

export type HashStoreDocument = {
  id: string;
  fileName: string;
  hash: string;
  cid: string;
  wallet: string;
  txHash: string;
  timestamp: string;
  createdAt: string;
  status: "authentic" | "tampered";
  qrCode?: string;
  events?: Array<{ at: string; label: string }>;
};

export type HashStoreSnapshot = {
  verified: number;
  tampered: number;
  pending: number;
  total: number;
  documents: HashStoreDocument[];
};

type VerifyDocumentResult =
  | { found: false; status: "not_found" }
  | { found: true; status: "authentic" | "tampered"; comparisonResult: "match" | "mismatch"; document: HashStoreDocument };

export class HashStoreService {
  constructor(
    private readonly filePath = path.resolve(process.cwd(), "data/documents.json"),
  ) {}

  async loadSnapshot(): Promise<HashStoreSnapshot> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<HashStoreSnapshot>;
      return this.normalizeSnapshot(parsed);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        await this.ensureStoreExists();
        return this.createEmptySnapshot();
      }
      throw error;
    }
  }

  async loadDocuments(): Promise<HashStoreDocument[]> {
    const snapshot = await this.loadSnapshot();
    return snapshot.documents;
  }

  async saveSnapshot(snapshot: HashStoreSnapshot) {
    await this.ensureStoreExists();
    const normalizedSnapshot = this.normalizeSnapshot(snapshot);
    await writeFile(this.filePath, JSON.stringify(normalizedSnapshot, null, 2));
  }

  async saveDocuments(documents: HashStoreDocument[]) {
    const snapshot = this.recalculateStats({
      ...(await this.loadSnapshot()),
      documents,
    });
    await this.saveSnapshot(snapshot);
  }

  async findDocumentByName(fileName: string) {
    const documents = await this.loadDocuments();
    return documents.find((document) => document.fileName === fileName) ?? null;
  }

  async findDocumentById(id: string) {
    const documents = await this.loadDocuments();
    return documents.find((document) => document.id === id) ?? null;
  }

  async addDocument(document: HashStoreDocument) {
    const documents = await this.loadDocuments();
    const filteredDocuments = documents.filter((entry) => entry.fileName !== document.fileName);
    const createdAt = document.createdAt || document.timestamp || new Date().toISOString();
    const qrCode =
      document.qrCode ??
      (await qrService.generateDocumentQRCode({
        hash: document.hash,
        cid: document.cid,
        txHash: document.txHash,
        wallet: document.wallet,
        status: document.status,
        timestamp: document.timestamp,
        fileName: document.fileName,
      }));

    filteredDocuments.push({
      ...document,
      id: document.id || crypto.randomUUID(),
      createdAt,
      qrCode,
      events: document.events ?? [
        { at: createdAt, label: "Verified Document" },
        { at: createdAt, label: "Blockchain Registered" },
        { at: createdAt, label: "IPFS Stored" },
      ],
    });
    await this.saveDocuments(filteredDocuments);

    console.info("[HashStore] Stored Hash:", document.hash);
    console.info("[HashStore] New Hash:", document.hash);
    console.info("[HashStore] Comparison Result:", "new_record");
    console.info("[HashStore] Status Returned:", "registered");

    return document;
  }

  async verifyDocument(fileName: string, newHash: string): Promise<VerifyDocumentResult> {
    const snapshot = await this.loadSnapshot();
    const existingDocument = snapshot.documents.find((document) => document.fileName === fileName);

    if (!existingDocument) {
      console.info("[HashStore] Stored Hash:", "not_found");
      console.info("[HashStore] New Hash:", newHash);
      console.info("[HashStore] Comparison Result:", "not_found");
      console.info("[HashStore] Status Returned:", "not_found");

      return {
        found: false,
        status: "not_found",
      };
    }

    const comparisonResult = existingDocument.hash === newHash ? "match" : "mismatch";
    existingDocument.status = comparisonResult === "match" ? "authentic" : "tampered";
    if (comparisonResult === "mismatch") {
      existingDocument.events = [
        ...(existingDocument.events ?? []),
        { at: new Date().toISOString(), label: "Hash Mismatch Detected" },
      ];
    }
    await this.saveSnapshot(
      this.recalculateStats({
        ...snapshot,
        documents: snapshot.documents,
      }),
    );

    console.info("[HashStore] Stored Hash:", existingDocument.hash);
    console.info("[HashStore] New Hash:", newHash);
    console.info("[HashStore] Comparison Result:", comparisonResult);
    console.info("[HashStore] Status Returned:", existingDocument.status);

    return {
      found: true,
      status: existingDocument.status,
      comparisonResult,
      document: existingDocument,
    };
  }

  private async ensureStoreExists() {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      await readFile(this.filePath, "utf8");
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        await writeFile(this.filePath, JSON.stringify(this.createEmptySnapshot(), null, 2));
        return;
      }
      throw error;
    }
  }

  private createEmptySnapshot(): HashStoreSnapshot {
    return {
      verified: 0,
      tampered: 0,
      pending: 0,
      total: 0,
      documents: [],
    };
  }

  private normalizeSnapshot(snapshot: Partial<HashStoreSnapshot>) {
    const documents = Array.isArray(snapshot.documents) ? snapshot.documents : [];
    return this.recalculateStats({
      verified: snapshot.verified ?? 0,
      tampered: snapshot.tampered ?? 0,
      pending: snapshot.pending ?? 0,
      total: snapshot.total ?? documents.length,
      documents: documents.map((document) => ({
        id: document.id || crypto.randomUUID(),
        fileName: document.fileName,
        hash: document.hash,
        cid: document.cid,
        wallet: document.wallet ?? "",
        txHash: document.txHash,
        timestamp: document.timestamp,
        createdAt: document.createdAt ?? document.timestamp,
        status: document.status,
        qrCode: document.qrCode,
        events: document.events ?? [],
      })),
    });
  }

  private recalculateStats(snapshot: HashStoreSnapshot): HashStoreSnapshot {
    const verified = snapshot.documents.filter((document) => document.status === "authentic").length;
    const tampered = snapshot.documents.filter((document) => document.status === "tampered").length;
    const pending = snapshot.documents.filter((document) => document.status !== "authentic" && document.status !== "tampered").length;
    return {
      ...snapshot,
      verified,
      tampered,
      pending,
      total: snapshot.documents.length,
    };
  }
}

export const hashStoreService = new HashStoreService();
