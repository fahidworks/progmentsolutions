import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard, FileText, CalendarCheck, PlaneTakeoff, FolderLock, Megaphone,
  User, Users, Wallet, ShieldCheck, LogOut, Menu, X, ArrowLeft, UserCheck, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/hooks/use-hr";
import { site } from "@/lib/site";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/portal")({
  component: PortalLayout,
});

const employeeLinks = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/portal/payslips", label: "Payslips", icon: FileText },
  { to: "/portal/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/portal/leave", label: "Leave", icon: PlaneTakeoff },
  { to: "/portal/documents", label: "Documents", icon: FolderLock },
  { to: "/portal/announcements", label: "Announcements", icon: Megaphone },
  { to: "/portal/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { to: "/portal/admin", label: "Admin Dashboard", icon: ShieldCheck },
  { to: "/portal/approvals", label: "Account approvals", icon: UserCheck },
  { to: "/portal/employees", label: "Employees", icon: Users },
  { to: "/portal/payroll", label: "Payroll", icon: Wallet },
];

function PortalLayout() {
  const { data: me, isLoading } = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {employeeLinks.map((l) => (
        <NavItem key={l.to} {...l} active={l.exact ? pathname === l.to : pathname.startsWith(l.to)} onClick={() => setOpen(false)} />
      ))}
      {me?.isStaff && (
        <>
          <p className="mt-5 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Administration</p>
          {adminLinks.map((l) => (
            <NavItem key={l.to} {...l} active={pathname.startsWith(l.to)} onClick={() => setOpen(false)} />
          ))}
        </>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-card p-4 sticky top-0 h-screen">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <img src={logoAsset.url} alt={`${site.name} logo`} className="h-10 w-auto object-contain" />
        </Link>
        {nav}
        <div className="mt-auto pt-4 border-t space-y-1">
          <Link to="/resources" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b">
          <div className="px-4 lg:px-8 h-16 flex items-center justify-between gap-3">
            <button className="lg:hidden p-2" aria-label="Toggle portal menu" onClick={() => setOpen((v) => !v)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {isLoading ? "Loading…" : me?.employee ? `${me.employee.first_name} ${me.employee.last_name}` : me?.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{me?.role ?? "employee"}</p>
            </div>
            <button onClick={signOut} className="lg:hidden p-2 text-muted-foreground" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          {open && <div className="lg:hidden border-t p-3">{nav}</div>}
        </header>
        <main className="p-4 lg:p-8 max-w-7xl">
          {!isLoading && me && !me.isStaff && me.accountStatus !== "approved" ? (
            <div className="mx-auto max-w-lg rounded-xl border bg-card p-8 text-center shadow-sm">
              <Clock className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-3 text-lg font-semibold">
                {me.accountStatus === "rejected" ? "Access denied" : "Awaiting administrator approval"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {me.accountStatus === "rejected"
                  ? "Your account request was rejected by the administrator. Please contact HR."
                  : "Your sign-up has been received. You will be able to view your payslips, attendance and documents once an administrator approves your account."}
              </p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label, icon: Icon, active, onClick }: { to: string; label: string; icon: typeof User; active: boolean; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
