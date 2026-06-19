import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getWallet, setWallet, saveRecords } from "@/lib/docdna";
import { getAuthUser, signOut } from "@/lib/auth";
import { Wallet, User, LogOut, Copy, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · DocDNA" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const nav = useNavigate();
  const [wallet, setW] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = getAuthUser();
    setW(getWallet());
    setName(user?.name || localStorage.getItem("docdna.name") || "Demo User");
    setEmail(user?.email || localStorage.getItem("docdna.email") || "demo@docdna.xyz");
  }, []);

  const reconnect = () => {
    const hex = "0123456789abcdef";
    const w = "0x" + Array.from({ length: 40 }, () => hex[Math.floor(Math.random() * 16)]).join("");
    setWallet(w); setW(w);
    toast.success("Wallet reconnected");
  };

  const copy = () => { navigator.clipboard.writeText(wallet); toast.success("Address copied"); };

  const saveProfile = () => {
    localStorage.setItem("docdna.name", name);
    localStorage.setItem("docdna.email", email);
    toast.success("Profile saved");
  };

  const clearAll = () => {
    if (!confirm("Clear all document history? This cannot be undone.")) return;
    saveRecords([]);
    toast.success("History cleared");
  };

  const logout = () => {
    signOut();
    toast.success("Signed out");
    nav({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Manage your wallet, profile, and workspace preferences.</p>
        </div>
        <div className="app-chip rounded-xl px-3 py-2 text-xs">Workspace controls</div>
      </div>

      <section className="app-panel rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><Wallet className="h-5 w-5" /></div>
          <div>
            <h2 className="font-semibold">Wallet</h2>
            <p className="text-xs text-muted-foreground">Connected to Polygon Amoy via Alchemy</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background/30 p-4">
          <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px] shadow-success" />
          <div className="min-w-0 flex-1 font-mono text-sm truncate">{wallet}</div>
          <button onClick={copy} className="rounded-md p-2 text-muted-foreground hover:bg-card hover:text-foreground"><Copy className="h-4 w-4" /></button>
          <button onClick={reconnect} className="inline-flex items-center gap-1.5 rounded-md bg-card px-3 py-1.5 text-xs ring-1 ring-border hover:bg-card/70"><RefreshCw className="h-3.5 w-3.5" /> Reconnect</button>
        </div>
      </section>

      <section className="app-panel rounded-2xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent"><User className="h-5 w-5" /></div>
          <div>
            <h2 className="font-semibold">Profile</h2>
            <p className="text-xs text-muted-foreground">Public display info</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Display name</span>
            <input value={name} onChange={e => setName(e.target.value)}
              className="app-input w-full px-3.5 py-2.5 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Email</span>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              className="app-input w-full px-3.5 py-2.5 text-sm outline-none" />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={saveProfile} className="app-button-primary px-5 py-2.5 text-sm font-semibold">Save changes</button>
        </div>
      </section>

      <section className="rounded-2xl border border-danger/30 bg-danger/5 p-6 shadow-soft">
        <h2 className="font-semibold text-danger">Danger zone</h2>
        <p className="mt-1 text-xs text-muted-foreground">These actions are irreversible.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={clearAll} className="inline-flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger hover:bg-danger/15"><Trash2 className="h-4 w-4" /> Clear history</button>
          <button onClick={logout} className="app-button-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </section>
    </div>
  );
}
