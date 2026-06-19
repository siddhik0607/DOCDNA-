import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Settings, Wallet, ShieldCheck, Clock3 } from "lucide-react";
import { getWallet, shortHash } from "@/lib/docdna";
import { getAuthUser } from "@/lib/auth";
import { BrandMark } from "@/components/BrandMark";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Verify Document", icon: ShieldCheck },
  { to: "/history", label: "Activity Timeline", icon: Clock3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const wallet = typeof window !== "undefined" ? getWallet() : "";
  const [userName, setUserName] = useState("Demo User");

  useEffect(() => {
    setUserName(getAuthUser()?.name || localStorage.getItem("docdna.name") || "Demo User");
  }, []);

  return (
    <div className="min-h-screen bg-background px-3 py-3 text-foreground sm:px-4 sm:py-4">
      <div className="app-frame mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1440px] overflow-hidden rounded-[2rem]">
        <aside className="hidden w-[280px] shrink-0 border-r border-border/80 bg-[linear-gradient(180deg,#F8F3ED,#F1EBE3)] lg:flex lg:flex-col">
          <Link to="/" className="flex items-center gap-3 px-6 py-6">
            <BrandMark className="h-10 w-10 text-primary" />
            <div>
              <div className="font-display text-lg font-semibold">DocDNA</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Verification Node v1.0</div>
            </div>
          </Link>

          <div className="px-6 text-xs text-muted-foreground">Stitch-inspired operational console</div>

          <nav className="mt-6 flex-1 space-y-2 px-4">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "border border-border/70 text-muted-foreground hover:border-primary/20 hover:bg-card hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />}
                </Link>
              );
            })}
          </nav>

          <div className="m-4 mt-auto rounded-2xl border border-border/70 bg-white/80 p-4 text-xs shadow-soft">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Organization</div>
            <div className="mt-2 text-sm font-medium">LegalChain Consortium</div>
            <div className="mt-1 text-muted-foreground">Premium Tier</div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-background/80 px-3 py-2">
              <Wallet className="h-3.5 w-3.5 text-primary" />
              <div className="min-w-0">
                <div className="truncate font-mono text-foreground">{shortHash(wallet, 5)}</div>
                <div className="text-[10px] text-muted-foreground">Connected wallet</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-[linear-gradient(180deg,#FFFEFC,#F8F4EE)]">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-4 backdrop-blur lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <BrandMark className="h-8 w-8 text-primary" />
              <div>
                <div className="font-display font-semibold">DocDNA</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Console</div>
              </div>
            </Link>
            <div className="text-right">
              <div className="text-xs font-medium">{userName}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{shortHash(wallet, 4)}</div>
            </div>
          </header>

          <div className="border-b border-border/50 px-4 py-4 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Operations console</div>
                <div className="mt-1 text-sm text-muted-foreground">Real-time cryptographic document verification analytics.</div>
              </div>
              <div className="hidden items-center gap-3 lg:flex">
                <div className="app-chip rounded-xl px-3 py-2 text-xs">Active user: {userName}</div>
                <div className="app-chip rounded-xl px-3 py-2 text-xs">{shortHash(wallet, 4)}</div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
            <Outlet />
          </div>

          <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t border-border bg-sidebar/95 backdrop-blur lg:hidden">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              return (
                <Link key={to} to={to} className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="h-16 lg:hidden" />
        </main>
      </div>
    </div>
  );
}
