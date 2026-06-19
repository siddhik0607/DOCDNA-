import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Download, ExternalLink, QrCode, ShieldAlert, ShieldCheck } from "lucide-react";
import { loadUserRecords, shortHash } from "@/lib/docdna";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/history/$recordId")({
  component: DocumentDetailsPage,
});

function DocumentDetailsPage() {
  const { recordId } = Route.useParams() as { recordId: string };
  const record = loadUserRecords().find((entry) => entry.id === recordId);

  if (!record) {
    return (
      <div className="app-panel rounded-3xl p-10">
        <div className="text-lg font-semibold">Document not found</div>
        <p className="mt-2 text-sm text-muted-foreground">The requested document details are not available in the current verification history.</p>
        <Link to="/history" className="mt-4 inline-flex rounded-xl border border-border px-4 py-2 text-sm">
          Back to history
        </Link>
      </div>
    );
  }

  const authentic = record.status === "authentic";
  const scanPayload = [
    ["Document Name", record.name],
    ["Status", record.status],
    ["SHA256 Hash", record.hash],
    ["IPFS CID", record.cid],
    ["Blockchain Transaction", record.txHash],
    ["Owner Wallet", record.wallet],
    ["Verification Timestamp", new Date(record.timestamp).toLocaleString()],
    ["Polygon Amoy Registration", authentic ? "Registered" : "Tamper detected"],
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Document Details</div>
          <h1 className="mt-2 text-3xl font-semibold">{record.name}</h1>
        </div>
        <Link to="/history" className="rounded-xl border border-border px-4 py-2 text-sm">
          Back to history
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl p-3 ${authentic ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
              {authentic ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Verification</div>
              <div className={`text-lg font-semibold ${authentic ? "text-success" : "text-danger"}`}>
                {authentic ? "Verified" : "Tampered"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center rounded-3xl border border-white/10 bg-black/20 p-5">
            {record.qrCode ? (
              <img src={record.qrCode} alt="Document QR code" className="h-64 w-64 rounded-[1.5rem] object-contain" />
            ) : (
              <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-border text-muted-foreground">
                <QrCode className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            {record.qrCode && (
              <a
                href={record.qrCode}
                download={`${record.name.replace(/\.[^.]+$/, "")}-qr.png`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-sm font-medium hover:bg-card"
              >
                <Download className="h-4 w-4" /> Download QR
              </a>
            )}
          </div>
        </div>

        <div className="space-y-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField label="SHA256 Hash" value={record.hash} />
            <DetailField label="IPFS CID" value={record.cid} link={`https://gateway.pinata.cloud/ipfs/${record.cid}`} />
            <DetailField label="Transaction Hash" value={record.txHash} link={`https://amoy.polygonscan.com/tx/${record.txHash}`} />
            <DetailField label="Wallet Address" value={record.wallet} />
          </div>

          <div className="rounded-2xl border border-border bg-background/20 p-5">
            <div className="text-sm font-semibold">QR Verification View</div>
            <div className="mt-4 space-y-3">
              {scanPayload.map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
                  <div className="max-w-full break-all text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {record.changes && record.changes.length > 0 && (
            <div className="rounded-2xl border border-danger/20 bg-danger/8 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-danger">Changed Fields</div>
                <div className="text-xs text-muted-foreground">Trust Score {record.trustScore ?? 25}/100</div>
              </div>
              <div className="mt-4 space-y-3">
                {record.changes.map((change, index) => (
                  <div key={`${change.field}-${index}`} className="grid gap-3 rounded-xl border border-danger/10 bg-black/10 p-4 md:grid-cols-[160px_1fr_1fr]">
                    <div className="text-sm font-medium">{change.field}</div>
                    <div className="rounded-lg bg-danger/12 px-3 py-2 text-sm text-white">{change.from}</div>
                    <div className="rounded-lg bg-success/12 px-3 py-2 text-sm text-white">{change.to}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value, link }: { label: string; value: string; link?: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <div className="rounded-2xl border border-border bg-background/20 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="flex items-center gap-1">
          <button onClick={copy} className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground">
            <Copy className="h-4 w-4" />
          </button>
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
      <div className="break-all font-mono text-xs">{shortHash(value, 12)}</div>
      <div className="mt-2 break-all text-[11px] text-muted-foreground">{value}</div>
    </div>
  );
}
