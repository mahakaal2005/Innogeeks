import React from "react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/lib/admin-auth";
import { Loader2, LayoutDashboard, Users, UserPlus, Calendar, Radio, Globe, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const { signIn } = useAdminAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      alert("Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-20">
      <Card className="glass-panel border-white/10 bg-white/5 shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-display text-white">Admin Login</CardTitle>
          <CardDescription className="text-white/60">
            Sign in to access the club management panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Email</label>
              <input
                type="email"
                className="w-full p-2 rounded-md bg-white/5 border border-white/20 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Password</label>
              <input
                type="password"
                className="w-full p-2 rounded-md bg-white/5 border border-white/20 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Roles & Members", icon: Users },
  { href: "/admin/recruitment", label: "Recruitment", icon: UserPlus },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/broadcasts", label: "Broadcasts", icon: Radio },
  { href: "/admin/club-info", label: "Edit Website", icon: Globe },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, configured, session, signOut } = useAdminAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="glass-panel max-w-md border-white/10 bg-white/5">
          <CardContent className="p-6 text-center text-white/70">
            Admin login isn't configured on the server yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto items-start">
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2 glass-panel border border-white/10 bg-white/5 p-4 rounded-xl">
        <div className="px-3 pb-4 mb-2 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Admin Hub</h2>
          <p className="text-xs text-white/50">{session.user.email}</p>
        </div>
        {NAV_ITEMS.map((item) => {
          const active = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            </Link>
          );
        })}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
      <div className="flex-1 w-full min-w-0">
        {children}
      </div>
    </div>
  );
}
