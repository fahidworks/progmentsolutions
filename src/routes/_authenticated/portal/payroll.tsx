import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listPayroll, calculatePayroll, approvePayroll, getPayslip } from "@/lib/hr.functions";
import { PageHeader, Panel, EmptyState, LoadingRows, StatusBadge, StatCard } from "@/components/hr/ui";
import { Button } from "@/components/ui/button";
import { inr, monthNames } from "@/lib/payroll";
import { site } from "@/lib/site";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/payroll")({ component: Payroll });

function Payroll() {
  const now = new Date();
  const qc = useQueryClient();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const listFn = useServerFn(listPayroll);
  const calcFn = useServerFn(calculatePayroll);
  const approveFn = useServerFn(approvePayroll);
  const slipFn = useServerFn(getPayslip);

  const { data, isLoading, error } = useQuery({ queryKey: ["hr", "payroll", year, month], queryFn: () => listFn({ data: { year, month } }) });
  const rows = data ?? [];
  const invalidate = () => qc.invalidateQueries({ queryKey: ["hr", "payroll", year, month] });

  const calc = useMutation({
    mutationFn: () => calcFn({ data: { year, month } }),
    onSuccess: (r) => { toast.success(`Payroll calculated for ${r.processed} employees`); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const approve = useMutation({
    mutationFn: () => approveFn({ data: { year, month } }),
    onSuccess: (r) => { toast.success(`${r.approved} payrolls approved and locked`); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function download(payrollId: string) {
    try {
      const { payroll, items } = await slipFn({ data: { payrollId } });
      const emp = payroll.employees as Record<string, string | null>;
      const slip = (payroll.payslips as { payslip_number: string }[] | null)?.[0];
      const { generatePayslipPdf } = await import("@/lib/payslip-pdf");
      generatePayslipPdf({
        companyName: `${site.name} Software Technologies Pvt. Ltd.`,
        companyAddress: site.address,
        payslipNumber: slip?.payslip_number ?? "DRAFT",
        month: payroll.payroll_month, year: payroll.payroll_year,
        employee: {
          name: `${emp["first_name"]} ${emp["last_name"]}`, code: String(emp["employee_code"]),
          designation: emp["designation"],
          department: (payroll.employees as { departments?: { name?: string } | null })?.departments?.name ?? null,
          joining_date: emp["joining_date"], pan: emp["pan"], uan: emp["uan"],
          bank_name: emp["bank_name"], bank_account_number: emp["bank_account_number"],
        },
        items, gross: Number(payroll.gross_salary), totalDeductions: Number(payroll.total_deductions),
        net: Number(payroll.net_salary), generatedBy: "Progment Solution HR",
      });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not generate payslip"); }
  }

  function exportCsv() {
    const header = "Employee,Department,Gross,Deductions,Net,Status\n";
    const body = rows.map((r) => {
      const e = r.employees as { employee_code: string; first_name: string; last_name: string; departments?: { name?: string } | null } | null;
      return [`${e?.first_name} ${e?.last_name} (${e?.employee_code})`, e?.departments?.name ?? "", r.gross_salary, r.total_deductions, r.net_salary, r.status].join(",");
    }).join("\n");
    const url = URL.createObjectURL(new Blob([header + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = `payroll-${year}-${String(month).padStart(2, "0")}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (error) return <EmptyState title="Administrator access required" hint={(error as Error).message} />;

  return (
    <>
      <PageHeader
        title="Payroll processing"
        description="Calculate, review, approve and lock monthly payroll."
        action={
          <div className="flex flex-wrap gap-2">
            <select className="h-9 rounded-md border bg-background px-2 text-sm" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {monthNames.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select className="h-9 rounded-md border bg-background px-2 text-sm" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <Button variant="outline" onClick={() => calc.mutate()} disabled={calc.isPending}>Calculate</Button>
            <Button onClick={() => approve.mutate()} disabled={approve.isPending}>Approve & lock</Button>
            <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Employees in run" value={rows.length} />
        <StatCard label="Total net payout" value={inr(rows.reduce((s, r) => s + Number(r.net_salary), 0))} />
        <StatCard label="Pending approval" value={rows.filter((r) => r.status !== "approved").length} />
      </div>
      <Panel title={`${monthNames[month - 1]} ${year} payroll`}>
        {isLoading ? <LoadingRows /> : rows.length === 0 ? <EmptyState title="No payroll for this period" hint="Use Calculate to generate the payroll run." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="py-2">Employee</th><th>Department</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Status</th><th></th></tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => {
                  const e = r.employees as { employee_code: string; first_name: string; last_name: string; departments?: { name?: string } | null } | null;
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 font-medium">{e?.first_name} {e?.last_name}<div className="text-xs text-muted-foreground">{e?.employee_code}</div></td>
                      <td>{e?.departments?.name ?? "—"}</td>
                      <td>{inr(Number(r.gross_salary))}</td>
                      <td>{inr(Number(r.total_deductions))}</td>
                      <td className="font-semibold">{inr(Number(r.net_salary))}</td>
                      <td><StatusBadge status={r.status} />{r.locked && <span className="ml-1 text-[11px] text-muted-foreground">locked</span>}</td>
                      <td className="text-right"><Button size="sm" variant="outline" onClick={() => download(r.id)}><Download className="h-3.5 w-3.5 mr-1" /> Payslip</Button></td>
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
