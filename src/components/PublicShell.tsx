import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, UserRoundPlus } from "lucide-react";
import { Particles } from "@/components/Particles";
import { BrandMark } from "@/components/BrandMark";
import { footerColumns } from "@/lib/publicContent";
import { getAuthUser, signOut, subscribeAuth, type AuthUser } from "@/lib/auth";
import { toast } from "sonner";

type PublicShellProps = {
  children: ReactNode;
  currentPath: "/" | "/features" | "/dashboard" | "/audit-confidence" | "/about";
};

const navLinks = [
  { label: "Home", href: "/" as const },
  { label: "Features", href: "/features" as const },
  { label: "Dashboard", href: "/dashboard" as const },
  { label: "Audit Confidence", href: "/audit-confidence" as const },
  { label: "About", href: "/about" as const },
];

export function PublicShell({ children, currentPath }: PublicShellProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getAuthUser());
    return subscribeAuth(() => setUser(getAuthUser()));
  }, []);

  const handleLogout = () => {
    signOut();
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <div className="fade-in-page relative min-h-screen overflow-hidden bg-background text-foreground">
      <Particles />
      <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top,rgba(242,141,87,0.12),transparent_60%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <BrandMark className="h-11 w-11 text-primary" />
          <div>
            <div className="font-display text-lg font-semibold">DocDNA</div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-primary/80">verify.protect.trust</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground xl:flex">
          {navLinks.map(item => (
            <a
              key={item.href}
              href={item.href}
              className={currentPath === item.href ? "text-foreground" : "transition hover:text-foreground"}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            to="/sign-up"
            className="app-button-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
          >
            <UserRoundPlus className="h-4 w-4" /> Sign up
          </Link>
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="app-button-secondary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          )}
        </div>
      </header>

      {children}

      <footer className="relative z-10 mt-8 border-t border-border bg-white/60 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="h-12 w-12 text-primary" />
              <div>
                <div className="font-display text-xl font-semibold text-foreground">DocDNA</div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-primary/80">verify.protect.trust</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Professional document verification for legal, compliance, and operations teams with trusted records, clear activity history, and confidence-ready workflows.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-foreground">Product</div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              {footerColumns.product.map(item => (
                <a key={item.href} href={item.href} className="transition hover:text-foreground">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-foreground">Resources</div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              {footerColumns.resources.map(item => (
                <a key={item.href} href={item.href} className="transition hover:text-foreground">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-foreground">Company</div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              {footerColumns.company.map(item => (
                <a key={item.href} href={item.href} className="transition hover:text-foreground">
                  {item.label}
                </a>
              ))}
              <span>support@docdna.app</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>© {new Date().getFullYear()} DocDNA. Trusted verification for modern teams.</div>
            <div className="flex flex-wrap gap-4">
              <span>Privacy-first workflows</span>
              <span>Immutable records</span>
              <span>Audit-ready experience</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
