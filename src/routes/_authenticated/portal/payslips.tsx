import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listMyPayslips, getPayslip } from "@/lib/hr.functions";
import { PageHeader, Panel, EmptyState, LoadingRows, StatusBadge } from "@/components/hr/ui";
import { Button } from "@/components/ui/button";
import { inr, monthNames } from "@/lib/payroll";
import { site } from "@/lib/site";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/payslips")({ component: Payslips });

function Payslips() {
  const listFn = useServerFn(listMyPayslips);
  const detailFn = useServerFn(getPayslip);
  const { data, isLoading } = useQuery({ queryKey: ["hr", "payslips"], queryFn: () => listFn() });

  async function download(payrollId: string, payslipNumber: string) {
    try {
      const { payroll, items } = await detailFn({ data: { payrollId } });
      const emp = payroll.employees as Record<string, string | null>;
      const { generatePayslipPdf } = await import("@/lib/payslip-pdf");
      generatePayslipPdf({
        companyName: `${site.name} Software Technologies Pvt. Ltd.`,
        companyAddress: site.address,
        payslipNumber,
        month: payroll.payroll_month,
        year: payroll.payroll_year,
        employee: {
          name: `${emp["first_name"]} ${emp["last_name"]}`,
          code: String(emp["employee_code"]),
          designation: emp["designation"],
          department: (payroll.employees as { departments?: { name?: string } | null })?.departments?.name ?? null,
          joining_date: emp["joining_date"], pan: emp["pan"], uan: emp["uan"],
          bank_name: emp["bank_name"], bank_account_number: emp["bank_account_number"],
        },
        items,
        gross: Number(payroll.gross_salary),
        totalDeductions: Number(payroll.total_deductions),
        net: Number(payroll.net_salary),
        generatedBy: "Progment Solution HR",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate payslip");
    }
  }

  return (
    <>
      <PageHeader title="Payslips" description="Download your monthly payslips as PDF." />
      <Panel title="Payroll history">
        {isLoading ? <LoadingRows /> : !data || data.length === 0 ? <EmptyState title="No payslips available yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="py-2">Period</th><th>Payslip no.</th><th>Gross</th><th>Deductions</th><th>Net pay</th><th>Status</th><th></th></tr>
              </thead>
              <tbody className="divide-y">
                {data.map((p) => {
                  const pr = p.payrolls as { payroll_month: number; payroll_year: number; gross_salary: number; total_deductions: number; net_salary: number; status: string };
                  return (
                    <tr key={p.id}>
                      <td className="py-3 font-medium">{monthNames[pr.payroll_month - 1]} {pr.payroll_year}</td>
                      <td className="text-muted-foreground">{p.payslip_number}</td>
                      <td>{inr(Number(pr.gross_salary))}</td>
                      <td>{inr(Number(pr.total_deductions))}</td>
                      <td className="font-semibold">{inr(Number(pr.net_salary))}</td>
                      <td><StatusBadge status={pr.status} /></td>
                      <td className="text-right">
                        <Button size="sm" variant="outline" onClick={() => download(p.payroll_id, p.payslip_number)}>
                          <Download className="h-3.5 w-3.5 mr-1" /> PDF
                        </Button>
                      </td>
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
