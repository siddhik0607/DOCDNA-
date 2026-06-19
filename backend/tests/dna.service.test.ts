import { describe, expect, it } from "@jest/globals";
import { dnaService } from "../src/services/dna.service.js";

describe("dnaService", () => {
  it("generates a base64 svg fingerprint", () => {
    const dna = dnaService.generate("f92253956b2ddfcdd2ddd758dde0ff3ecf8ea1e0f6cccffa588c9ff9eb7ec6db");
    expect(dna.startsWith("data:image/svg+xml;base64,")).toBe(true);
  });
});
