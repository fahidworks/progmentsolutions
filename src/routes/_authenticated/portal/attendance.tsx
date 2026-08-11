import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listAttendance } from "@/lib/hr.functions";
import { PageHeader, Panel, EmptyState, LoadingRows, StatusBadge, StatCard } from "@/components/hr/ui";
import { monthNames } from "@/lib/payroll";

export const Route = createFileRoute("/_authenticated/portal/attendance")({ component: Attendance });

function Attendance() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const fn = useServerFn(listAttendance);
  const { data, isLoading } = useQuery({ queryKey: ["hr", "attendance", year, month], queryFn: () => fn({ data: { year, month } }) });
  const rows = data ?? [];
  const count = (s: string) => rows.filter((r) => r.status === s).length;

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Daily attendance record for the selected month."
        action={
          <div className="flex gap-2">
            <select className="h-9 rounded-md border bg-background px-2 text-sm" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {monthNames.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select className="h-9 rounded-md border bg-background px-2 text-sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Present" value={count("present")} />
        <StatCard label="Work from home" value={count("wfh")} />
        <StatCard label="Leave" value={count("leave")} />
        <StatCard label="Absent" value={count("absent")} />
      </div>
      <Panel title={`${monthNames[month - 1]} ${year}`}>
        {isLoading ? <LoadingRows /> : rows.length === 0 ? <EmptyState title="No attendance records for this month" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="py-2">Date</th><th>Employee</th><th>Check in</th><th>Check out</th><th>Hours</th><th>Status</th></tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => {
                  const e = r.employees as { first_name: string; last_name: string } | null;
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5">{r.attendance_date}</td>
                      <td>{e ? `${e.first_name} ${e.last_name}` : "—"}</td>
                      <td>{r.check_in ?? "—"}</td>
                      <td>{r.check_out ?? "—"}</td>
                      <td>{r.working_hours ?? "—"}</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
