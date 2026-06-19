import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { formatBytes, loadUserRecords, shortHash, subscribeRecords, type DocRecord } from "@/lib/docdna";
import { Search, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/history")({
  head: () => ({ meta: [{ title: "History · DocDNA" }] }),
  component: HistoryPage,
});

type Filter = "all" | "authentic" | "tampered";

function HistoryPage() {
  const [records, setRecords] = useState<DocRecord[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  useEffect(() => {
    const sync = () => setRecords(loadUserRecords());
    sync();
    return subscribeRecords(sync);
  }, []);

  const filtered = useMemo(() => records
    .filter(r => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      const ql = q.toLowerCase();
      return (
        r.name.toLowerCase().includes(ql) ||
        r.hash.toLowerCase().includes(ql) ||
        r.cid.toLowerCase().includes(ql) ||
        r.txHash.toLowerCase().includes(ql) ||
        r.wallet.toLowerCase().includes(ql)
      );
    })
    .sort((a, b) => b.timestamp - a.timestamp), [records, q, filter]);

  const authenticCount = records.filter(r => r.status === "authentic").length;
  const tamperedCount = records.filter(r => r.status === "tampered").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Document History</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Every uploaded document stays here with its proof details and verification trail.</p>
        </div>
        <div className="app-chip rounded-xl px-3 py-2 text-xs">Persistent proof archive</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="app-panel rounded-2xl p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Total Documents</div>
          <div className="mt-3 font-display text-3xl font-semibold">{records.length}</div>
          <div className="mt-2 text-xs text-muted-foreground">Saved verification records</div>
        </div>
        <div className="app-panel rounded-2xl p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Verified</div>
          <div className="mt-3 font-display text-3xl font-semibold text-success">{authenticCount}</div>
          <div className="mt-2 text-xs text-muted-foreground">Matching proof hashes</div>
        </div>
        <div className="app-panel rounded-2xl p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Tampered</div>
          <div className="mt-3 font-display text-3xl font-semibold text-danger">{tamperedCount}</div>
          <div className="mt-2 text-xs text-muted-foreground">Detected proof mismatches</div>
        </div>
      </div>

      <div className="app-panel flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <div className="relative flex-1 min-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by name, hash, CID, transaction, or wallet..."
            className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
          />
        </div>
        <div className="flex rounded-xl border border-border bg-card/60 p-1 text-xs">
          {(["all","authentic","tampered"] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3.5 py-1.5 capitalize transition ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="app-panel rounded-2xl py-20 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No document history yet. Upload a document to begin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(record => <HistoryCard key={record.id} record={record} />)}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ record }: { record: DocRecord }) {
  const authentic = record.status === "authentic";
  const orderedEvents = [...record.events].sort((a, b) => a.at - b.at);

  return (
    <div className="app-panel rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="truncate text-lg font-semibold">{record.name}</h2>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              authentic ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}>
              {record.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Uploaded {new Date(record.timestamp).toLocaleString()} · {formatBytes(record.size)}
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
          authentic ? "bg-success/8 text-success" : "bg-danger/8 text-danger"
        }`}>
          {authentic ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {authentic ? "Proof verified" : "Tampering detected"}
        </div>
      </div>

      <div className="mt-4">
        <a
          href={`/history/${record.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-medium hover:bg-card"
        >
          View document details
        </a>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <Field label="SHA-256" value={record.hash} mono />
        <Field label="IPFS CID" value={record.cid} mono />
        <Field label="Transaction ID" value={record.txHash} mono />
        <Field label="Owner Wallet" value={record.wallet} mono />
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background/30 p-4">
        <div className="mb-4 text-sm font-semibold">Verification Trail</div>
        <div className="space-y-3">
          {orderedEvents.map((event, index) => <HistoryEvent key={`${record.id}-${index}`} at={event.at} label={event.label} />)}
        </div>
      </div>

      {!authentic && record.changes && (
        <div className="mt-5 rounded-2xl border border-danger/15 bg-danger/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-danger">Detected Changes</div>
            {typeof record.trustScore === "number" && (
              <div className="text-xs text-muted-foreground">
                Trust score <span className="font-semibold text-danger">{record.trustScore}/100</span>
              </div>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {record.changes.map((change, index) => (
              <div key={`${record.id}-change-${index}`} className="rounded-xl border border-danger/10 bg-white/70 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{change.field}</div>
                <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded-lg bg-danger/10 px-3 py-2 text-danger">{change.from}</div>
                  <div className="rounded-lg bg-success/10 px-3 py-2 text-success">{change.to}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryEvent({ at, label }: { at: number; label: string }) {
  const tone = label.toLowerCase().includes("tamper") || label.toLowerCase().includes("modification")
    ? "danger"
    : label.toLowerCase().includes("verified") || label.toLowerCase().includes("anchored")
    ? "success"
    : "primary";
  const Icon = tone === "danger" ? XCircle : tone === "success" ? CheckCircle2 : Loader2;
  const ring = tone === "danger" ? "bg-danger/15 text-danger" : tone === "success" ? "bg-success/15 text-success" : "bg-primary/15 text-primary";

  return (
    <div className="flex items-start gap-3">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${ring}`}>
        <Icon className={`h-4 w-4 ${tone === "primary" ? "animate-spin" : ""}`} />
      </div>
      <div className="min-w-0 flex-1 rounded-xl border border-border bg-card/50 p-3">
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">{new Date(at).toLocaleString()}</div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background/30 p-4">
      <div className="mb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`break-all text-sm ${mono ? "font-mono text-xs" : ""}`}>{mono ? shortHash(value, 10) : value}</div>
      {mono && <div className="mt-2 break-all font-mono text-[11px] text-muted-foreground">{value}</div>}
    </div>
  );
}
