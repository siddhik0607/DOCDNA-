import { describe, expect, it } from "@jest/globals";
import { TamperDetectionService } from "../src/services/tamperDetection.service.js";

describe("TamperDetectionService", () => {
  it("generates a tampered report when hashes differ", async () => {
    const auditEvents: string[] = [];
    const service = new TamperDetectionService({
      prismaClient: {
        document: {
          findFirst: async () => ({
            id: "doc-1",
            ownerWallet: "0xabc",
          }),
          update: async () => undefined,
        },
        verificationLog: {
          create: async () => undefined,
        },
      } as never,
      pinata: {
        retrieveFromIPFS: async () => Buffer.from("original"),
      } as never,
      ai: {
        compareDocuments: async () => ({
          trustScore: 32,
          similarityScore: 54,
          changes: [
            { field: "Salary", oldValue: "INR 10000", newValue: "INR 20000" },
            { field: "Joining Date", oldValue: "12/06/2026", newValue: "20/06/2026" },
          ],
        }),
      } as never,
      audit: {
        log: async (_documentId: string | null, eventType: string) => {
          auditEvents.push(eventType);
        },
        emit: async (eventType: string) => {
          auditEvents.push(eventType);
        },
      } as never,
    });

    const report = await service.generateTamperReport({
      originalDocument: {
        id: "doc-1",
        fileName: "OfferLetter.pdf",
        hash: "stored-hash",
        cid: "cid-1",
        wallet: "0xabc",
        txHash: "0xtx",
        timestamp: "2026-06-12T00:00:00.000Z",
        createdAt: "2026-06-12T00:00:00.000Z",
        status: "authentic",
        events: [{ at: "2026-06-12T00:00:00.000Z", label: "Verified Document" }],
      },
      uploadedHash: "new-hash",
      uploadedBuffer: Buffer.from("tampered"),
      uploadedFileName: "OfferLetter.pdf",
      uploadedFileType: "application/pdf",
    });

    expect(report.status).toBe("tampered");
    expect(report.verification).toBe(false);
    expect(report.trustScore).toBe(25);
    expect(report.changes).toHaveLength(2);
    expect(auditEvents).toEqual(["TAMPER_DETECTED", "REPORT_GENERATED", "tamper_detection"]);
  });
});
