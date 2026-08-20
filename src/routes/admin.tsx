import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { adminSignIn } from "@/lib/hr.functions";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administrator Login — Progment Solution" },
      { name: "description", content: "Restricted administrator login for the Progment Solution employee resources, payroll and approvals dashboard." },
      { property: "og:title", content: "Administrator Login — Progment Solution" },
      { property: "og:description", content: "Restricted administrator access to payroll, approvals and employee records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const verify = useServerFn(adminSignIn);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { email } = await verify({ data: { username, password } });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      toast.success("Welcome, administrator");
      navigate({ to: "/portal/admin", replace: true });
    } catch (err) {
      toast.error((err as Error).message || "Wrong username or password — access denied");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="bg-secondary/40 py-16">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-card border rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-10 w-10 rounded-lg grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-bar)" }}>
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h1 className="font-semibold text-lg">Administrator Login</h1>
                <p className="text-xs text-muted-foreground">Restricted access</p>
              </div>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-user">Username</Label>
                <Input id="admin-user" required value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-pass">Password</Label>
                <Input id="admin-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
              <Button className="w-full" disabled={loading}>{loading ? "Verifying…" : "Sign in as administrator"}</Button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
