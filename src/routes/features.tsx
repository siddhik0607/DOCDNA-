import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { publicFeatures, publicSteps } from "@/lib/publicContent";

export const Route = createFileRoute("/features")({
  head: () => ({ meta: [{ title: "Features · DocDNA" }] }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <PublicShell currentPath="/features">
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="app-frame rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="text-xs uppercase tracking-[0.3em] text-accent">Features</div>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Clear verification tools for fast-moving legal and operations teams.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            DocDNA brings verification, review, audit evidence, and workflow visibility into one calm interface built for trust-focused teams.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {publicFeatures.map(({ icon: Icon, title, desc, href }) => (
            <a key={title} href={href || "/features"} className="group app-panel-hover rounded-2xl p-6">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary transition group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm text-primary">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-accent">Workflow</div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">From upload to result, every step stays readable.</h2>
          </div>
          <Link to="/upload" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
            Open verification flow <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {publicSteps.map((step, index) => (
            <div key={step.title} className="app-panel-hover rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/15 text-accent">
                  <step.icon className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs font-mono text-muted-foreground">0{index + 1}</div>
              </div>
              <h3 className="mt-5 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            "Dashboard views stay structured across desktop, tablet, and mobile layouts.",
            "Verification records are ready to present to reviewers without extra cleanup.",
            "Audit evidence remains easy to scan with status, time, and ownership context.",
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
