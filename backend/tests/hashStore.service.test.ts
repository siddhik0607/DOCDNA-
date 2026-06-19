import { mkdtemp, readFile } from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, it } from "@jest/globals";
import { HashStoreService } from "../src/services/hashStore.service.js";

describe("HashStoreService", () => {
  it("stores and verifies document hashes by filename", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "docdna-hash-store-"));
    const filePath = path.join(tempDirectory, "documents.json");
    const service = new HashStoreService(filePath);

    await service.addDocument({
      id: "doc-1",
      fileName: "OfferLetter.pdf",
      hash: "hash-1",
      cid: "cid-1",
      wallet: "0xabc",
      txHash: "tx-1",
      timestamp: "2026-06-12T00:00:00.000Z",
      createdAt: "2026-06-12T00:00:00.000Z",
      status: "authentic",
      events: [{ at: "2026-06-12T00:00:00.000Z", label: "Verified Document" }],
    });

    const authenticResult = await service.verifyDocument("OfferLetter.pdf", "hash-1");
    expect(authenticResult).toMatchObject({
      found: true,
      status: "authentic",
      comparisonResult: "match",
    });

    const tamperedResult = await service.verifyDocument("OfferLetter.pdf", "hash-2");
    expect(tamperedResult).toMatchObject({
      found: true,
      status: "tampered",
      comparisonResult: "mismatch",
    });

    const stored = JSON.parse(await readFile(filePath, "utf8")) as { documents: Array<{ status: string }> };
    expect(stored.documents[0]?.status).toBe("tampered");
  });
});
