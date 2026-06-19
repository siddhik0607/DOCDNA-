import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { loadRecords, shortHash, type DocRecord } from "@/lib/docdna";
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
  useEffect(() => { setRecords(loadRecords()); }, []);

  const filtered = useMemo(() => records.filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
    if (!q) return true;
    const ql = q.toLowerCase();
    return r.name.toLowerCase().includes(ql) || r.hash.includes(ql) || r.cid.includes(ql);
  }), [records, q, filter]);

  // Flatten to event timeline
  const timeline = filtered
    .flatMap(r => r.events.map(e => ({ ...e, rec: r })))
    .sort((a, b) => b.at - a.at);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Activity Timeline</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Review every verification event across your document network.</p>
        </div>
        <div className="app-chip rounded-xl px-3 py-2 text-xs">Audit-ready event stream</div>
      </div>

      <div className="app-panel flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <div className="relative flex-1 min-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by name, hash or CID…"
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

      {timeline.length === 0 ? (
        <div className="app-panel rounded-2xl py-20 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No events yet. Upload a document to begin.</p>
        </div>
      ) : (
        <div className="app-panel relative rounded-2xl p-6">
          <div className="absolute bottom-6 left-[42px] top-6 w-px bg-border" />
          <ul className="space-y-5">
            {timeline.map((e, i) => <TimelineRow key={i} ev={e} />)}
          </ul>
        </div>
      )}
    </div>
  );
}

function TimelineRow({ ev }: { ev: { at: number; label: string; rec: DocRecord } }) {
  const tone = ev.label.toLowerCase().includes("tamper") || ev.label.toLowerCase().includes("modification")
    ? "danger"
    : ev.label.toLowerCase().includes("verified") || ev.label.toLowerCase().includes("anchored")
    ? "success" : "primary";
  const Icon = tone === "danger" ? XCircle : tone === "success" ? CheckCircle2 : Loader2;
  const ring = tone === "danger" ? "bg-danger/15 text-danger" : tone === "success" ? "bg-success/15 text-success" : "bg-primary/15 text-primary";
  return (
    <li className="relative flex items-start gap-4">
      <div className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-card ${ring}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 rounded-xl border border-border bg-background/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-medium">{ev.label}</div>
          <div className="font-mono text-xs text-muted-foreground">{new Date(ev.at).toLocaleString()}</div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-md bg-card px-2 py-0.5">{ev.rec.name}</span>
          <span className="font-mono">hash {shortHash(ev.rec.hash)}</span>
          <span className="font-mono">cid {shortHash(ev.rec.cid, 5)}</span>
        </div>
      </div>
    </li>
  );
}
