import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, Mail, UserRound, UserRoundPlus } from "lucide-react";
import { Particles } from "@/components/Particles";
import { getAuthUser, setAuthUser } from "@/lib/auth";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";

interface AuthScreenProps {
  mode: "signin" | "signup";
}

function deriveName(email: string) {
  const base = email.split("@")[0] || "User";
  return base
    .split(/[._-]/g)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AuthScreen({ mode }: AuthScreenProps) {
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(isSignup ? "" : "demo@docdna.xyz");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const current = getAuthUser();
    if (current) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedName = (isSignup ? name : name || localStorage.getItem("docdna.name") || deriveName(trimmedEmail)).trim();

    if (!trimmedEmail || !password.trim() || (isSignup && !trimmedName)) {
      toast.error("Please fill in all required credentials");
      return;
    }

    setAuthUser({
      name: trimmedName,
      email: trimmedEmail,
    });

    toast.success(isSignup ? "Account created successfully" : "Signed in successfully");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="fade-in-page relative min-h-screen overflow-hidden bg-background text-foreground">
      <Particles />
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(242,141,87,0.12),transparent_62%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_28rem] lg:items-center">
          <div className="app-frame hidden rounded-[2rem] p-8 lg:block xl:p-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <BrandMark className="h-10 w-10 text-primary" />
              <div>
                <div className="font-display text-lg font-semibold">DocDNA</div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-primary/80">secure access</div>
              </div>
            </Link>

            <div className="mt-10 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground">
                <LockKeyhole className="h-3.5 w-3.5 text-accent" />
                Protected workspace access
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-tight">
                {isSignup ? "Create your DocDNA account." : "Sign in to your verification workspace."}
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {isSignup
                  ? "Create your profile to manage document verification, activity history, and trusted records in one responsive workspace."
                  : "Use your credentials to access the dashboard, review verification activity, and continue managing your documents."}
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Secure access", desc: "Credential-based entry for your workspace." },
                { title: "Clear workflow", desc: "Upload, verify, and review in one place." },
                { title: "Responsive UI", desc: "Optimized for desktop, tablet, and mobile." },
              ].map(item => (
                <div key={item.title} className="app-panel-hover rounded-2xl p-4">
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-panel mx-auto w-full max-w-md rounded-[2rem] bg-white/95 p-6 backdrop-blur sm:p-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>

            <div className="mt-6">
              <div className="text-xs uppercase tracking-[0.3em] text-accent">
                {isSignup ? "Create account" : "Welcome back"}
              </div>
              <h2 className="mt-2 text-3xl font-semibold">
                {isSignup ? "Sign up" : "Sign in"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isSignup
                  ? "Enter your details to create a user account."
                  : "Enter your credentials to access your dashboard."}
              </p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {isSignup && (
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Full name</span>
                  <div className="app-input flex items-center gap-2 px-3.5 py-3">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Arjun Mehta"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Email</span>
                <div className="app-input flex items-center gap-2 px-3.5 py-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Password</span>
                <div className="app-input flex items-center gap-2 px-3.5 py-3">
                  <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={isSignup ? "Create a strong password" : "Enter your password"}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
              </label>

              <button
                type="submit"
                className="app-button-primary inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-semibold"
              >
                {isSignup ? <UserRoundPlus className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                {isSignup ? "Create account" : "Continue to dashboard"}
              </button>
            </form>

            <div className="app-panel mt-6 rounded-2xl p-4 text-sm text-muted-foreground">
              {isSignup ? (
                <span>
                  Already have an account?{" "}
                  <a href="/sign-in" className="font-medium text-primary hover:text-primary-glow">Sign in</a>
                </span>
              ) : (
                <span>
                  New here?{" "}
                  <a href="/sign-up" className="font-medium text-primary hover:text-primary-glow">Create an account</a>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
