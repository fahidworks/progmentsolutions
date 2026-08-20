import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { adminSignIn } from "@/lib/hr.functions";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Employee Sign In — Progment Solution Resources" },
      { name: "description", content: "Secure sign in for Progment Solution employees and HR administrators to access payroll, payslips, attendance and leave." },
      { property: "og:title", content: "Employee Sign In — Progment Solution" },
      { property: "og:description", content: "Secure access to the Progment Solution employee resources and payroll portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const verifyAdmin = useServerFn(adminSignIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/portal", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const identifier = email.trim();
    try {
      // Administrators sign in with a username (no "@"); employees use their work email.
      let loginEmail = identifier.toLowerCase();
      const isAdminLogin = !identifier.includes("@");
      if (isAdminLogin) {
        const res = await verifyAdmin({ data: { username: identifier, password } });
        loginEmail = res.email;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error) throw new Error(isAdminLogin ? "Wrong username or password — access denied" : error.message);
      toast.success("Signed in");
      navigate({ to: isAdminLogin ? "/portal/admin" : "/portal", replace: true });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: window.location.origin + "/portal" },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!data.session) return toast.success("Check your email to confirm your account.");
    toast.success("Account created");
    navigate({ to: "/portal", replace: true });
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
                <h1 className="font-semibold text-lg">Resources Portal</h1>
                <p className="text-xs text-muted-foreground">Employees & HR administrators</p>
              </div>
            </div>

            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={signIn} className="space-y-4 pt-4">
                  <Field id="si-email" label="Work email or admin username" type="text" value={email} onChange={setEmail} />
                  <Field id="si-password" label="Password" type="password" value={password} onChange={setPassword} />
                  <Button className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signUp} className="space-y-4 pt-4">
                  <Field id="su-email" label="Work email" type="email" value={email} onChange={setEmail} />
                  <Field id="su-password" label="Password" type="password" value={password} onChange={setPassword} />
                  <p className="text-xs text-muted-foreground">
                    Use the email address registered with HR — your employee record links automatically.
                  </p>
                  <Button className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-muted-foreground mt-6 text-center">
              Trouble signing in? <Link to="/contact" className="text-primary font-medium">Contact HR</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ id, label, type, value, onChange }: { id: string; label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} required value={value} onChange={(e) => onChange(e.target.value)} autoComplete={type === "password" ? "current-password" : "email"} />
    </div>
  );
}
