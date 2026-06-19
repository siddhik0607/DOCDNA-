import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, FileSearch, CheckCircle2, ArrowRight, Scale, ShieldCheck, Users, BriefcaseBusiness } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { publicFeatures, publicStats, publicSteps } from "@/lib/publicContent";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DocDNA - Trusted Document Verification" },
      { name: "description", content: "Professional document verification, secure audit trails, and responsive workflows for modern teams." },
      { property: "og:title", content: "DocDNA" },
      { property: "og:description", content: "Secure document verification with professional dashboards and audit-ready workflows." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <PublicShell currentPath="/">
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pb-24">
        <div className="app-frame rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Enterprise-ready verification workspace
            </div>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr] xl:items-center">
            <div className="max-w-3xl">
              <h1
                className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                A <span className="gradient-text">Digital DNA</span> For Every Document
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                DocDNA helps teams verify documents, manage proof records, and present a clean audit story in a fast, professional interface built for legal, compliance, and operations teams.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#68b356] px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-[#75bf62]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Explore Verification
                </Link>
                <Link
                  to="/upload"
                  className="app-button-secondary inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-semibold"
                >
                  <FileSearch className="h-4 w-4" /> Upload Document
                </Link>
              </div>
              <div className="mt-8 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Secure verification workflow</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Clear activity history</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Responsive team dashboard</div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="app-panel rounded-[1.75rem] bg-[#fffdfa] p-5">
                <div className="app-chip flex items-center justify-between rounded-2xl px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">Workspace overview</div>
                    <div className="text-xs text-muted-foreground">Real-time verification posture</div>
                  </div>
                  <div className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">Healthy</div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {publicStats.slice(0, 2).map(item => (
                    <div key={item.label} className="app-panel-hover rounded-2xl p-4">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</div>
                      <div className="mt-2 text-3xl font-semibold">{item.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{item.delta}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {publicStats.map(item => (
            <div key={item.label} className="app-panel-hover rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-3xl font-semibold">{item.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{item.delta}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 app-panel rounded-[2rem] p-6">
          <div className="mb-6 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-accent">Built For Teams</div>
            <h2 className="mt-2 text-xl font-semibold">Professional verification support across every document workflow.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              DocDNA is designed to help teams verify records faster, present proof more clearly, and keep document decisions aligned across legal, compliance, and business operations.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: Scale,
                title: "Legal Review",
                desc: "Review contracts, resolutions, and supporting documents with clear verification status.",
              },
              {
                icon: ShieldCheck,
                title: "Compliance Readiness",
                desc: "Keep audit trails, timestamps, and proof records organized for internal and external review.",
              },
              {
                icon: BriefcaseBusiness,
                title: "Operations Control",
                desc: "Manage uploads, verification actions, and approvals from one structured workspace.",
              },
              {
                icon: Users,
                title: "Stakeholder Confidence",
                desc: "Present trusted records to leadership, partners, and clients in a professional format.",
              },
            ].map(item => (
              <div key={item.title} className="app-panel-hover rounded-2xl p-5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-accent">Capabilities</div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Everything you need for a cleaner horizontal workflow.</h2>
          </div>
          <div className="text-sm text-muted-foreground">Designed to scan fast and move left-to-right.</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {publicFeatures.map(({ icon: Icon, title, desc, href }) => (
            <a key={title} href={href || "/features"} className="group app-panel-hover rounded-2xl p-6">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary transition group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-accent">How it works</div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">A simple left-to-right process from upload to trusted result.</h2>
          </div>
          <Link to="/features" className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-glow">
            View all features <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {publicSteps.map((step, i) => (
            <div key={step.title} className="app-panel-hover relative rounded-2xl p-6">
              <div className="absolute right-5 top-5 text-xs font-mono text-muted-foreground">0{i + 1}</div>
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-accent/15 text-accent">
                <step.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            "Clear navigation for upload, verification, activity, and settings.",
            "Balanced cards that keep the experience easy to scan on every screen.",
            "Dedicated public pages for dashboard experience and audit confidence details.",
          ].map(item => (
            <div key={item} className="app-panel-hover rounded-2xl p-5 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{item}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
