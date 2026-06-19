import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LayoutDashboard, Monitor, TabletSmartphone, Smartphone } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { dashboardHighlights, dashboardMetrics } from "@/lib/publicContent";

export const Route = createFileRoute("/responsive-dashboard")({
  head: () => ({ meta: [{ title: "Responsive Dashboard · DocDNA" }] }),
  component: ResponsiveDashboardPage,
});

function ResponsiveDashboardPage() {
  return (
    <PublicShell currentPath="/responsive-dashboard">
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="app-frame rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Responsive Dashboard
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            A verification dashboard that stays readable on every screen.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Teams can review document status, recent actions, and verification health from desktop workstations, tablets in meetings, or phones on the move.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map(item => (
            <div key={item.label} className="app-panel-hover rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</div>
              <div className="mt-2 font-display text-3xl font-semibold">{item.value}</div>
              <div className={`mt-1 text-xs ${item.tone}`}>{item.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="app-panel rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-accent">Layouts</div>
                <h2 className="mt-2 text-2xl font-semibold">Optimized for every device</h2>
              </div>
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
                Open app dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Monitor, title: "Desktop", desc: "Wide-panel analytics, document tables, and activity sidebars for operational depth." },
                { icon: TabletSmartphone, title: "Tablet", desc: "Balanced two-column layouts for reviews in meetings and approval workflows." },
                { icon: Smartphone, title: "Mobile", desc: "Prioritized cards and compact status blocks that stay easy to scan on smaller screens." },
              ].map(item => (
                <div key={item.title} className="app-panel-hover rounded-2xl p-5">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {dashboardHighlights.map(item => (
              <div key={item} className="app-panel-hover rounded-2xl p-5 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
