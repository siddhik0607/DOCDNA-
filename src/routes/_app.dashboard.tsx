import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getDashboardStats, getRecentActivity, getTrendSeries, loadUserRecords, subscribeRecords, type DocRecord } from "@/lib/docdna";
import {
  ShieldCheck, ShieldAlert, Clock, Upload, ArrowRight,
  CalendarRange, FileUp, TriangleAlert,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · DocDNA" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [records, setRecords] = useState<DocRecord[]>([]);
  useEffect(() => {
    const sync = () => setRecords(loadUserRecords());
    sync();
    return subscribeRecords(sync);
  }, []);

  const { verified, tampered, pending, fraudAlerts } = getDashboardStats(records);
  const trends = getTrendSeries(records);

  const stats = [
    { label: "Verified Documents", value: verified, icon: ShieldCheck, tone: "text-success", note: `${verified} authentic uploads` },
    { label: "Pending Documents", value: pending, icon: Clock, tone: "text-warning", note: `${pending} awaiting review` },
    { label: "Tampered Documents", value: tampered, icon: ShieldAlert, tone: "text-danger", note: `${tampered} hash mismatches` },
    { label: "Fraud Alerts", value: fraudAlerts, icon: TriangleAlert, tone: "text-primary", note: `${fraudAlerts} live alerts` },
  ];

  const displayHistory = getRecentActivity(records);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Organization Overview</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Real-time cryptographic document verification analytics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="app-chip inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
            <CalendarRange className="h-3.5 w-3.5" /> Last 30 Days
          </div>
          <Link to="/upload" className="app-button-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-soft">
            <Upload className="h-4 w-4" /> New Verification
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone, note }) => (
          <div key={label} className="app-panel rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
                <div className="mt-4 font-display text-3xl font-semibold">{value}</div>
              </div>
              <div className={`rounded-lg bg-background/60 p-2 ${tone}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className={`mt-3 text-xs ${tone}`}>{note}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="app-panel rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Verification Volume</h2>
              <p className="text-xs text-muted-foreground">Bar graph based on this user's upload and verification history.</p>
            </div>
            <div className="text-xs text-muted-foreground">{records.length} total uploads</div>
          </div>
          <div className="h-56 w-full">
            {trends.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                Upload documents to generate real verification analytics.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ left: -26, right: 8, top: 8, bottom: 0 }} barGap={8}>
                <CartesianGrid stroke="rgba(60, 44, 31, 0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#9C948E" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9C948E" fontSize={10} tickLine={false} axisLine={false} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(242, 141, 87, 0.06)" }}
                  contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(60, 44, 31, 0.08)", borderRadius: 14, fontSize: 12, color: "#2C2926", boxShadow: "0 14px 32px -24px rgba(104, 78, 51, 0.22)" }}
                />
                <Bar dataKey="authentic" name="Authentic Documents" fill="#7ABF67" radius={[8, 8, 0, 0]} />
                <Bar dataKey="tampered" name="Tampered Documents" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="app-panel rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Recent History</h2>
                <p className="mt-1 text-xs text-muted-foreground">Latest document proofs saved from your verification uploads.</p>
              </div>
              <Link to="/history" className="text-xs font-medium text-primary hover:text-primary-glow">
                View all
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {displayHistory.length > 0 ? displayHistory.map(item => (
                <div key={item.key} className="flex items-start gap-3">
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    item.tone === "tampered" ? "bg-danger" : item.tone === "pending" ? "bg-warning" : "bg-success"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{item.detail}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{item.time}</div>
                </div>
              )) : (
                <div className="text-sm text-muted-foreground">No recent activity yet. Upload a document to populate the timeline.</div>
              )}
            </div>
          </div>

          <div className="app-panel rounded-2xl p-6">
            <h2 className="text-base font-semibold">Quick Verify</h2>
            <p className="mt-1 text-xs text-muted-foreground">Drop a file or jump straight into the verification flow.</p>
            <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/35 p-6 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                <FileUp className="h-5 w-5" />
              </div>
              <div className="mt-4 text-sm font-medium">Drag & Drop</div>
              <div className="mt-1 text-xs text-muted-foreground">PDF, DOCX, or image files</div>
              <Link to="/upload" className="app-button-primary mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium">
                Open Verify Flow <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
