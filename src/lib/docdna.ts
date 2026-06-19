import QRCode from "qrcode";

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
  createdAt: string;
  status: DocStatus;
  qrCode?: string;
  changes?: { field: string; from: string; to: string }[];
  trustScore?: number;
  events: { at: number; label: string }[];
}

type RawDocChange = {
  field?: unknown;
  from?: unknown;
  to?: unknown;
  oldValue?: unknown;
  newValue?: unknown;
};

type RawDocRecord = Partial<DocRecord> & {
  fileName?: unknown;
  documentName?: unknown;
  ownerWallet?: unknown;
  changes?: unknown;
  events?: unknown;
};

const KEY = "docdna.records.v1";
const WKEY = "docdna.wallet.v1";
const RECORD_EVENT = "docdna-records-change";
const CURRENT_RESULT_KEY = "docdna.current-result.v1";

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
  try {
    const records = JSON.parse(localStorage.getItem(KEY) || "[]") as RawDocRecord[];
    return Array.isArray(records)
      ? records.map(normalizeDocRecord)
      : [];
  } catch {
    return [];
  }
}

export function loadUserRecords(wallet = getWallet()): DocRecord[] {
  const normalizedWallet = wallet.toLowerCase();
  return loadRecords().filter((record) => record.wallet.toLowerCase() === normalizedWallet);
}

export function saveRecords(records: DocRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(RECORD_EVENT));
}

export function addRecord(rec: DocRecord) {
  const all = loadRecords();
  all.unshift(rec);
  saveRecords(all);
}

export function loadCurrentResult(): DocRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_RESULT_KEY);
    if (!raw) return null;
    return normalizeDocRecord(JSON.parse(raw) as RawDocRecord);
  } catch {
    return null;
  }
}

export function saveCurrentResult(record: DocRecord | null) {
  if (typeof window === "undefined") return;
  if (!record) {
    localStorage.removeItem(CURRENT_RESULT_KEY);
  } else {
    localStorage.setItem(CURRENT_RESULT_KEY, JSON.stringify(normalizeDocRecord(record)));
  }
  window.dispatchEvent(new Event(RECORD_EVENT));
}

export function subscribeRecords(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(RECORD_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(RECORD_EVENT, handler);
  };
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

export function detectTamper(
  name: string,
  hash: string,
  size?: number,
  wallet = getWallet(),
): DocRecord | null {
  void size;
  const records = loadUserRecords(wallet);
  const possibleOriginal = records.find((r) => r.name === name && r.hash !== hash);

  return possibleOriginal ?? null;
}
export function findByHash(hash: string, wallet = getWallet()): DocRecord | null {
  return loadUserRecords(wallet).find(r => r.hash === hash) ?? null;
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

export async function generateDocumentQRCode(payload: {
  hash: string;
  cid: string;
  txHash: string;
  wallet: string;
  status: DocStatus;
  timestamp: number;
  name?: string;
}) {
  return QRCode.toDataURL(
    JSON.stringify({
      documentName: payload.name,
      hash: payload.hash,
      cid: payload.cid,
      txHash: payload.txHash,
      wallet: payload.wallet,
      status: payload.status,
      timestamp: new Date(payload.timestamp).toISOString(),
      network: "Polygon Amoy",
    }),
    {
      width: 320,
      margin: 3,
      errorCorrectionLevel: "H",
      color: {
        dark: "#111111",
        light: "#FFFFFFFF",
      },
    },
  );
}

export function getDashboardStats(records: DocRecord[]) {
  const verified = records.filter((record) => record.status === "authentic").length;
  const tampered = records.filter((record) => record.status === "tampered").length;
  const pending = records.filter((record) => record.status === "pending").length;
  return {
    verified,
    tampered,
    pending,
    total: records.length,
    fraudAlerts: tampered,
  };
}

export function getTrendSeries(records: DocRecord[]) {
  const grouped = new Map<string, { authentic: number; tampered: number }>();

  records.forEach((record) => {
    const key = new Date(record.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const existing = grouped.get(key) ?? { authentic: 0, tampered: 0 };
    if (record.status === "authentic") existing.authentic += 1;
    if (record.status === "tampered") existing.tampered += 1;
    grouped.set(key, existing);
  });

  return Array.from(grouped.entries())
    .map(([label, values]) => ({
      label,
      authentic: values.authentic,
      tampered: values.tampered,
      total: values.authentic + values.tampered,
    }))
    .sort((left, right) => new Date(left.label).getTime() - new Date(right.label).getTime());
}

export function getRecentActivity(records: DocRecord[]) {
  return records
    .flatMap((record) =>
      record.events.map((event, index) => ({
        key: `${record.id}-${index}`,
        title: event.label,
        detail: record.name,
        time: new Date(event.at).toLocaleString(),
        at: event.at,
        tone: record.status,
      })),
    )
    .sort((left, right) => right.at - left.at)
    .slice(0, 8);
}

function normalizeDocRecord(record: RawDocRecord): DocRecord {
  const timestamp = normalizeTimestamp(record.timestamp);
  const createdAt =
    typeof record.createdAt === "string" && record.createdAt
      ? record.createdAt
      : new Date(timestamp).toISOString();
  const changes = normalizeChanges(record.changes);
  const events = normalizeEvents(record.events, timestamp);
  const rawStatus = typeof record.status === "string" ? record.status.toLowerCase() : "pending";
  const status: DocStatus =
    rawStatus === "authentic" || rawStatus === "tampered" || rawStatus === "pending"
      ? rawStatus
      : "pending";

  return {
    id: typeof record.id === "string" && record.id ? record.id : crypto.randomUUID(),
    name: firstString(record.name, record.fileName, record.documentName, "Unknown Document"),
    size: typeof record.size === "number" ? record.size : 0,
    hash: firstString(record.hash, ""),
    cid: firstString(record.cid, ""),
    txHash: firstString(record.txHash, ""),
    wallet: firstString(record.wallet, record.ownerWallet, ""),
    timestamp,
    createdAt,
    status,
    qrCode: typeof record.qrCode === "string" ? record.qrCode : undefined,
    changes,
    trustScore: typeof record.trustScore === "number" ? record.trustScore : undefined,
    events,
  };
}

function normalizeChanges(changes: unknown): Array<{ field: string; from: string; to: string }> | undefined {
  if (!Array.isArray(changes)) return undefined;

  const normalized = changes
    .map((change) => {
      const rawChange = (change ?? {}) as RawDocChange;
      return {
        field: firstString(rawChange.field, "Document Content"),
        from: firstString(rawChange.from, rawChange.oldValue, "Original"),
        to: firstString(rawChange.to, rawChange.newValue, "Modified"),
      };
    })
    .filter((change) => change.field || change.from || change.to);

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeEvents(events: unknown, timestamp: number) {
  if (!Array.isArray(events)) {
    return [{ at: timestamp, label: "Uploaded for verification" }];
  }

  const normalized = events
    .map((event) => {
      const rawEvent = (event ?? {}) as { at?: unknown; label?: unknown };
      return {
        at: normalizeTimestamp(rawEvent.at, timestamp),
        label: firstString(rawEvent.label, "Uploaded for verification"),
      };
    })
    .filter((event) => Boolean(event.label));

  return normalized.length > 0 ? normalized : [{ at: timestamp, label: "Uploaded for verification" }];
}

function normalizeTimestamp(value: unknown, fallback = Date.now()) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value) return value;
  }
  return "";
}
