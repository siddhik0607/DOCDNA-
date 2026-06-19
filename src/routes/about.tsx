import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Scale, ShieldCheck, Users2 } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About · DocDNA" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicShell currentPath="/about">
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="app-frame rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="text-xs uppercase tracking-[0.3em] text-accent">About DocDNA</div>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">Minimal proof. Clear trust.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            DocDNA is a document verification workspace for legal, compliance, and operations teams that need fast review, clear audit trails, and confidence-ready records.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Scale, title: "Legal Teams", desc: "Review contracts, resolutions, and supporting evidence with cleaner status visibility." },
            { icon: ShieldCheck, title: "Compliance", desc: "Maintain documented verification histories for internal and external review." },
            { icon: Building2, title: "Operations", desc: "Keep document workflows organized without losing proof context." },
            { icon: Users2, title: "Stakeholders", desc: "Share confidence-ready summaries with leadership, partners, and clients." },
          ].map(item => (
            <div key={item.title} className="app-panel-hover rounded-2xl p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="app-panel rounded-[2rem] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-accent">Why it matters</div>
            <h2 className="mt-3 text-2xl font-semibold">Built to keep verification simple.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Every page is designed to make document review easier to scan, easier to explain, and easier to trust.
            </p>
          </div>

          <div className="app-panel rounded-[2rem] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-accent">Explore next</div>
            <h2 className="mt-3 text-2xl font-semibold">See the product in action.</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/dashboard" className="app-button-secondary inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold">
                Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/audit-confidence" className="app-button-secondary inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold">
                Audit Confidence <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
