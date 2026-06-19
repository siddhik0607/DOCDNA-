import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload as UploadIcon, FileText, Hash, Link2, Database, CheckCircle2,
  Loader2, ShieldCheck, ShieldAlert, Copy, ExternalLink, RotateCcw, Download,
} from "lucide-react";
import {
  sha256, mockCid, mockTx, getWallet, addRecord, detectTamper, findByHash,
  mockDiff, formatBytes, type DocRecord, generateDocumentQRCode, loadCurrentResult, saveCurrentResult,
} from "@/lib/docdna";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/upload")({
  head: () => ({ meta: [{ title: "Upload & Verify · DocDNA" }] }),
  component: UploadPage,
});

type Stage = "idle" | "hashing" | "ipfs" | "chain" | "done";

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<DocRecord | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedResult = loadCurrentResult();
    if (storedResult) {
      setResult(storedResult);
      setStage("done");
    }
  }, []);

  const reset = () => {
    setFile(null);
    setStage("idle");
    setResult(null);
    saveCurrentResult(null);
  };

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    saveCurrentResult(null);
    setStage("hashing");
    try {
      const hash = await sha256(f);
      await wait(700);

      // Check tamper / existing
      const wallet = getWallet();
      const prior = findByHash(hash, wallet);
      const tamperedFrom = detectTamper(f.name, hash, f.size, wallet);

      setStage("ipfs");
      const cid = mockCid();
      await wait(900);
      setStage("chain");
      const txHash = mockTx();
      await wait(1100);

      const now = Date.now();
      const qrCode = await generateDocumentQRCode({
        name: f.name,
        hash,
        cid,
        txHash,
        wallet,
        status: tamperedFrom ? "tampered" : "authentic",
        timestamp: now,
      });

      let rec: DocRecord;
      if (prior) {
        rec = {
          id: cryptoRandom(),
          name: f.name,
          size: f.size,
          hash,
          cid,
          txHash,
          wallet,
          timestamp: now,
          createdAt: new Date(now).toISOString(),
          status: "authentic",
          qrCode,
          events: [
            { at: now, label: "Uploaded for verification" },
            { at: now + 500, label: "SHA-256 generated" },
            { at: now + 1200, label: "Pinned on IPFS" },
            { at: now + 2000, label: "Re-verified — hash matches original proof" },
          ],
        };
        addRecord(rec);
        toast.success("Document verified — history updated.");
      } else if (tamperedFrom) {
        const diff = mockDiff(tamperedFrom.hash, hash);
        rec = {
          id: cryptoRandom(),
          name: f.name,
          size: f.size,
          hash, cid, txHash, wallet,
          timestamp: now,
          createdAt: new Date(now).toISOString(),
          status: "tampered",
          qrCode,
          changes: diff.changes,
          trustScore: diff.trustScore,
          events: [
            { at: now, label: "Uploaded for verification" },
            { at: now + 500, label: "SHA-256 generated" },
            { at: tamperedFrom.timestamp, label: "Original anchored" },
            { at: now, label: "Hash Mismatch Detected" },
            { at: now + 1000, label: "Tampered report generated" },
          ],
        };
        addRecord(rec);
        toast.error("Document is tampered.");
      } else {
        rec = {
          id: cryptoRandom(),
          name: f.name, size: f.size,
          hash, cid, txHash, wallet,
          timestamp: now,
          createdAt: new Date(now).toISOString(),
          status: "authentic",
          qrCode,
          events: [
            { at: now, label: "Uploaded for verification" },
            { at: now + 500, label: "SHA-256 generated" },
            { at: now + 1200, label: "IPFS Stored" },
            { at: now + 2000, label: "Blockchain Registered" },
          ],
        };
        addRecord(rec);
        toast.success("Document anchored on-chain.");
      }

      setResult(rec);
      saveCurrentResult(rec);
      setStage("done");
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong.");
      setStage("idle");
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Verify Document</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Drop a document to hash, verify, and register its proof trail.</p>
        </div>
        <div className="app-chip rounded-xl px-3 py-2 text-xs">Secure cryptographic verification</div>
      </div>

      <AnimatePresence mode="wait">
        {!file && !(result && stage === "done") && (
          <motion.label
            key="zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`relative block cursor-pointer overflow-hidden rounded-[1.75rem] border-2 border-dashed p-14 text-center transition-all ${
              drag ? "border-primary bg-primary/8" : "app-panel hover:border-primary/50 hover:bg-card/70"
            }`}
          >
            <input ref={inputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,image/*"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
              <UploadIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-display text-xl font-semibold">Drop your document here</h3>
            <p className="mt-1 text-sm text-muted-foreground">PDF, DOCX or image up to 25 MB</p>
            <button type="button" onClick={() => inputRef.current?.click()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-background/50 px-5 py-2.5 text-sm font-medium ring-1 ring-border hover:bg-card/70">
              Browse files
            </button>
          </motion.label>
        )}

        {file && stage !== "done" && (
          <motion.div key="processing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="app-panel rounded-[1.75rem] p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary"><FileText className="h-5 w-5" /></div>
              <div className="min-w-0">
                <div className="truncate font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">{formatBytes(file.size)}</div>
              </div>
            </div>
            <div className="space-y-3">
              <Step label="Generating SHA-256 hash" icon={Hash} active={stage === "hashing"} done={(["ipfs","chain","done"] as Stage[]).includes(stage)} />
              <Step label="Uploading to IPFS via Pinata" icon={Database} active={stage === "ipfs"} done={(["chain","done"] as Stage[]).includes(stage)} />
              <Step label="Anchoring on Polygon Amoy" icon={Link2} active={stage === "chain"} done={(stage as Stage) === "done"} />
            </div>
          </motion.div>
        )}

        {result && stage === "done" && (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ResultCard rec={result} onReset={reset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step({ label, icon: Icon, active, done }: { label: string; icon: any; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
      done ? "border-success/30 bg-success/5" : active ? "border-primary/40 bg-primary/8" : "border-border bg-background/30"
    }`}>
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${done ? "bg-success/20 text-success" : active ? "bg-primary/20 text-primary" : "bg-card text-muted-foreground"}`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      </div>
      <div className="text-sm">{label}</div>
      {done && <span className="ml-auto text-xs text-success">Done</span>}
    </div>
  );
}

function ResultCard({ rec, onReset }: { rec: DocRecord; onReset: () => void }) {
  const authentic = rec.status === "authentic";
  return (
    <div className="app-panel overflow-hidden rounded-[1.75rem] shadow-elegant">
      <div className={`flex items-center gap-3 border-b border-border px-8 py-5 ${authentic ? "bg-success/5" : "bg-danger/5"}`}>
        {authentic ? <ShieldCheck className="h-5 w-5 text-success" /> : <ShieldAlert className="h-5 w-5 text-danger" />}
        <div className="flex-1">
          <div className={`font-display text-lg font-semibold ${authentic ? "text-success" : "text-danger"}`}>
            {authentic ? "✓ Document Authentic" : "❌ Document Is Tampered"}
          </div>
          <div className="text-xs text-muted-foreground">{authentic ? "Hash matches the stored verification record." : "Hash mismatch detected — see changed fields and trust score below."}</div>
        </div>
        <button onClick={onReset} className="inline-flex items-center gap-1.5 rounded-xl bg-card px-3 py-1.5 text-xs ring-1 ring-border hover:bg-card/70">
          <RotateCcw className="h-3 w-3" /> New file
        </button>
      </div>

      <div className="grid gap-8 p-8 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col items-center justify-center gap-4">
          {rec.qrCode && (
            <div className="flex h-[260px] w-[260px] items-center justify-center rounded-[2rem] border border-border bg-black/35 p-5 backdrop-blur">
              <img src={rec.qrCode} alt="Document QR code" className="h-full w-full rounded-[1.5rem] object-contain" />
            </div>
          )}
          <div className="text-center">
            <div className="font-display text-sm">{rec.name}</div>
            <div className="text-xs text-muted-foreground">{formatBytes(rec.size)}</div>
          </div>
          {rec.qrCode && (
            <a
              href={rec.qrCode}
              download={`${rec.name.replace(/\.[^.]+$/, "")}-qr.png`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-medium hover:bg-card"
            >
              <Download className="h-4 w-4" /> Download QR
            </a>
          )}
        </div>

        <div className="space-y-4">
          <Field label="Owner Wallet" value={rec.wallet} mono />
          <Field label="Timestamp" value={new Date(rec.timestamp).toLocaleString()} />
          <Field label="Transaction ID" value={rec.txHash} mono link={`https://amoy.polygonscan.com/tx/${rec.txHash}`} />
          <Field label="IPFS CID" value={rec.cid} mono link={`https://gateway.pinata.cloud/ipfs/${rec.cid}`} />
          <Field label="SHA-256" value={rec.hash} mono />
        </div>
      </div>

      {!authentic && rec.changes && (
        <div className="border-t border-border bg-background/30 p-8">
          <div className="mb-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-danger">AI Diff Report</div>
              <h3 className="mt-1 text-lg font-semibold">Detected Changes</h3>
            </div>
            <TrustScore score={rec.trustScore ?? 32} />
          </div>
          <div className="space-y-2">
            {rec.changes.map((c, i) => (
              <div key={i} className="grid grid-cols-[120px_1fr] items-center gap-4 rounded-xl border border-border bg-card/50 p-4 sm:grid-cols-[160px_1fr_auto_1fr]">
                <div className="text-sm font-medium">{c.field}</div>
                <div className="rounded-md bg-danger/10 px-3 py-1.5 font-mono text-xs text-danger line-through">{c.from}</div>
                <span className="hidden text-muted-foreground sm:inline">→</span>
                <div className="rounded-md bg-success/10 px-3 py-1.5 font-mono text-xs text-success">{c.to}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TrustScore({ score }: { score: number }) {
  const color = score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-danger";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-2.5">
      <div className="text-xs text-muted-foreground">Trust Score</div>
      <div className={`font-display text-2xl font-semibold ${color}`}>{score}<span className="text-sm text-muted-foreground">/100</span></div>
    </div>
  );
}

function Field({ label, value, mono, link }: { label: string; value: string; mono?: boolean; link?: string }) {
  const copy = () => { navigator.clipboard.writeText(value); toast.success("Copied"); };
  return (
    <div className="rounded-xl border border-border bg-background/30 p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <button onClick={copy} className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
          {link && <a href={link} target="_blank" rel="noreferrer" className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground"><ExternalLink className="h-3.5 w-3.5" /></a>}
        </div>
      </div>
      <div className={`break-all text-sm ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function cryptoRandom(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}
