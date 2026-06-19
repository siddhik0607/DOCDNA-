import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { auditHighlights } from "@/lib/publicContent";

export const Route = createFileRoute("/audit-confidence")({
  head: () => ({ meta: [{ title: "Audit Confidence · DocDNA" }] }),
  component: AuditConfidencePage,
});

function AuditConfidencePage() {
  return (
    <PublicShell currentPath="/audit-confidence">
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="app-frame rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary">
            <BadgeCheck className="h-3.5 w-3.5" />
            Audit Confidence
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Present every verification result with proof that feels complete.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            DocDNA makes it easier to share verification status, timestamps, and document history with internal reviewers, outside counsel, and compliance stakeholders.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="app-panel rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-accent">Evidence</div>
                <h2 className="mt-2 text-2xl font-semibold">Review-ready verification details</h2>
              </div>
              <Link to="/history" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
                View activity timeline <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-background/60 text-left text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Record</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { record: "Sales agreement", status: "Verified", time: "24 May 2025, 11:45 AM" },
                    { record: "Lease amendment", status: "Pending", time: "23 May 2025, 04:30 PM" },
                    { record: "Board resolution", status: "Verified", time: "22 May 2025, 09:20 AM" },
                  ].map(item => (
                    <tr key={item.record} className="border-t border-border/70">
                      <td className="px-5 py-4 font-medium">{item.record}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          item.status === "Verified" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                        }`}>
                          {item.status === "Verified" ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            {auditHighlights.map(item => (
              <div key={item} className="app-panel-hover rounded-2xl p-5 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
            <div className="app-panel rounded-2xl p-5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">Confidence-ready presentation</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Give teams a single place to confirm the verification result, reference the proof record, and move to the next decision without reformatting the story.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
