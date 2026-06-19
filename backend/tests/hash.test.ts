import { describe, expect, it } from "@jest/globals";
import { sha256 } from "../src/utils/hash.js";

describe("sha256", () => {
  it("creates stable hashes", () => {
    expect(sha256(Buffer.from("Doc DNA"))).toBe("e0afd8682f6dfc1a8a8b8dfa6e4a8e7eaa7472aa6ce1519ac44c4ddb065712d5");
  });
});
