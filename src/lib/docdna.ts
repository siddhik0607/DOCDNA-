export type DocStatus = "authentic" | "tampered" | "pending";

export interface DocRecord {
  id: string;
  name: string;
  size: number;
  hash: string;
  cid: string;
  txHash: string;
  wallet: string;
  timestamp: number;
  status: DocStatus;
  changes?: { field: string; from: string; to: string }[];
  trustScore?: number;
  events: { at: number; label: string }[];
}

const KEY = "docdna.records.v1";
const WKEY = "docdna.wallet.v1";

export function getWallet(): string {
  if (typeof window === "undefined") return "";
  let w = localStorage.getItem(WKEY);
  if (!w) {
    const hex = "0123456789abcdef";
    w = "0x" + Array.from({ length: 40 }, () => hex[Math.floor(Math.random() * 16)]).join("");
    localStorage.setItem(WKEY, w);
  }
  return w;
}

export function setWallet(addr: string) {
  localStorage.setItem(WKEY, addr);
}

export function loadRecords(): DocRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function saveRecords(records: DocRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function addRecord(rec: DocRecord) {
  const all = loadRecords();
  all.unshift(rec);
  saveRecords(all);
}

export async function sha256(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function randomHex(len: number): string {
  const hex = "0123456789abcdef";
  return Array.from({ length: len }, () => hex[Math.floor(Math.random() * 16)]).join("");
}

export function mockCid(): string {
  // Simulated IPFS CIDv1 base32-ish
  const chars = "abcdefghijklmnopqrstuvwxyz234567";
  return "bafy" + Array.from({ length: 55 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function mockTx(): string {
  return "0x" + randomHex(64);
}

export function shortHash(h: string, n = 6): string {
  if (!h) return "";
  return `${h.slice(0, n)}…${h.slice(-n)}`;
}

export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

// Mock tamper detection: if filename matches an existing record but hash differs.
export function detectTamper(name: string, hash: string): DocRecord | null {
  const prior = loadRecords().find(r => r.name === name && r.hash !== hash && r.status === "authentic");
  return prior ?? null;
}

export function findByHash(hash: string): DocRecord | null {
  return loadRecords().find(r => r.hash === hash) ?? null;
}

// Deterministic mock "AI" diff — produces plausible-looking changes seeded by hashes.
export function mockDiff(originalHash: string, newHash: string) {
  const seed = parseInt(newHash.slice(0, 8), 16) ^ parseInt(originalHash.slice(0, 8), 16);
  const pool = [
    { field: "Salary", from: "₹10,000", to: "₹20,000" },
    { field: "Joining Date", from: "12/06/2026", to: "20/06/2026" },
    { field: "Designation", from: "Engineer", to: "Senior Engineer" },
    { field: "Bonus", from: "₹5,000", to: "₹15,000" },
    { field: "Notice Period", from: "30 days", to: "15 days" },
  ];
  const count = (seed % 2) + 2;
  const picked: typeof pool = [];
  for (let i = 0; i < count; i++) picked.push(pool[(seed + i * 7) % pool.length]);
  const trustScore = Math.max(15, 60 - count * 12 - (seed % 15));
  return { changes: picked, trustScore };
}
