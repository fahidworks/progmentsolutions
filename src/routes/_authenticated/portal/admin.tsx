import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStats } from "@/lib/hr.functions";
import { PageHeader, Panel, StatCard, EmptyState, LoadingRows } from "@/components/hr/ui";
import { inr } from "@/lib/payroll";

export const Route = createFileRoute("/_authenticated/portal/admin")({ component: AdminDashboard });

function AdminDashboard() {
  const fn = useServerFn(getAdminStats);
  const { data, isLoading, error } = useQuery({ queryKey: ["hr", "adminStats"], queryFn: () => fn() });

  if (isLoading) return <LoadingRows rows={6} />;
  if (error) return <EmptyState title="Administrator access required" hint={(error as Error).message} />;
  if (!data) return null;
  const max = Math.max(1, ...data.monthlyExpense.map((m) => m.value));

  return (
    <>
      <PageHeader title="Admin dashboard" description="Workforce and payroll overview." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard label="Total employees" value={data.totalEmployees} />
        <StatCard label="Active employees" value={data.activeEmployees} />
        <StatCard label="Payroll this month" value={data.payrollThisMonth} hint={`${data.pendingPayroll} pending approval`} />
        <StatCard label="Salary expense (month)" value={inr(data.salaryExpenseThisMonth)} />
        <StatCard label="On leave today" value={data.onLeaveToday} />
        <StatCard label="Pending leave requests" value={data.pendingLeaves} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Monthly payroll expense">
          <div className="space-y-2">
            {data.monthlyExpense.map((m) => (
              <div key={m.name} className="text-xs">
                <div className="flex justify-between mb-1"><span>{m.name}</span><span className="font-semibold">{inr(m.value)}</span></div>
                <div className="h-2 rounded bg-secondary"><div className="h-2 rounded bg-primary" style={{ width: `${(m.value / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Department-wise headcount">
          <ul className="space-y-2 text-sm">
            {data.departmentCounts.map((d) => (
              <li key={d.name} className="flex justify-between"><span>{d.name}</span><span className="font-semibold">{d.value}</span></li>
            ))}
          </ul>
        </Panel>
        <div className="lg:col-span-2">
          <Panel title="Recent activity">
            {data.recentActivity.length === 0 ? <EmptyState title="No activity recorded" /> : (
              <ul className="divide-y text-sm">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="flex justify-between py-2">
                    <span className="capitalize">{a.action.replace(/[._]/g, " ")}</span>
                    <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("en-IN")}</span>
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
