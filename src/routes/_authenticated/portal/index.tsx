import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getEmployeeDashboard } from "@/lib/hr.functions";
import { PageHeader, StatCard, Panel, EmptyState, LoadingRows } from "@/components/hr/ui";
import { inr, monthNames } from "@/lib/payroll";
import { Wallet, CalendarCheck, PlaneTakeoff, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/")({ component: Dashboard });

function Dashboard() {
  const fn = useServerFn(getEmployeeDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["hr", "dashboard"], queryFn: () => fn() });

  if (isLoading) return <LoadingRows rows={6} />;
  if (!data) {
    return <EmptyState title="No employee record linked to your account" hint="Ask HR to add your work email to the employee directory." />;
  }
  const latest = data.payslips[0]?.payrolls as { net_salary: number } | undefined;

  return (
    <>
      <PageHeader title={`Welcome back, ${data.employee.first_name}`} description={`${data.employee.designation ?? "Team member"} · ${data.employee.employee_code}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard label="Current month salary" value={inr(Number(latest?.net_salary ?? 0))} icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Present days" value={data.presentDays} hint="This month" icon={<CalendarCheck className="h-4 w-4" />} />
        <StatCard label="Leave balance" value={`${data.leaveBalance} days`} icon={<PlaneTakeoff className="h-4 w-4" />} />
        <StatCard label="Payslips" value={data.payslips.length} hint="Available to download" icon={<FileText className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Recent payslips" action={<Link to="/portal/payslips" className="text-xs font-semibold text-primary">View all</Link>}>
            {data.payslips.length === 0 ? <EmptyState title="No payslips yet" /> : (
              <ul className="divide-y">
                {data.payslips.map((p) => {
                  const pr = p.payrolls as { payroll_month: number; payroll_year: number; net_salary: number };
                  return (
                    <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                      <span>{monthNames[pr.payroll_month - 1]} {pr.payroll_year}</span>
                      <span className="font-semibold">{inr(Number(pr.net_salary))}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Quick actions">
            <div className="grid gap-2 text-sm">
              <Link to="/portal/payslips" className="rounded-md border px-3 py-2 hover:border-primary">Download payslip</Link>
              <Link to="/portal/leave" className="rounded-md border px-3 py-2 hover:border-primary">Apply for leave</Link>
              <Link to="/portal/attendance" className="rounded-md border px-3 py-2 hover:border-primary">View attendance</Link>
              <Link to="/portal/documents" className="rounded-md border px-3 py-2 hover:border-primary">Company documents</Link>
            </div>
          </Panel>
          <Panel title="Announcements">
            {data.announcements.length === 0 ? <EmptyState title="Nothing new" /> : (
              <ul className="space-y-3">
                {data.announcements.map((a) => (
                  <li key={a.id}>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
