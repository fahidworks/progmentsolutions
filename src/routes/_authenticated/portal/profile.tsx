import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateMyProfile, getMySalary } from "@/lib/hr.functions";
import { PageHeader, Panel, EmptyState, LoadingRows } from "@/components/hr/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMe } from "@/hooks/use-hr";
import { inr } from "@/lib/payroll";

export const Route = createFileRoute("/_authenticated/portal/profile")({ component: Profile });

function Profile() {
  const { data: me, isLoading } = useMe();
  const qc = useQueryClient();
  const salaryFn = useServerFn(getMySalary);
  const updateFn = useServerFn(updateMyProfile);
  const { data: salary } = useQuery({ queryKey: ["hr", "mySalary"], queryFn: () => salaryFn() });
  const [form, setForm] = useState({ phone: "", work_location: "" });

  useEffect(() => {
    if (me?.employee) setForm({ phone: me.employee.phone ?? "", work_location: me.employee.work_location ?? "" });
  }, [me?.employee]);

  const save = useMutation({
    mutationFn: () => updateFn({ data: form }),
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["hr", "me"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingRows rows={5} />;
  if (!me?.employee) return <EmptyState title="No employee record linked" hint="Ask HR to register your work email." />;
  const e = me.employee;

  return (
    <>
      <PageHeader title="My profile" description="Your employment details and permitted salary information." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Employment details">
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            {([["Employee ID", e.employee_code], ["Name", `${e.first_name} ${e.last_name}`], ["Email", e.email],
              ["Designation", e.designation ?? "—"], ["Employment type", e.employment_type],
              ["Date of joining", e.joining_date], ["Reporting manager", e.reporting_manager ?? "—"],
              ["PAN", e.pan ?? "—"], ["UAN", e.uan ?? "—"],
              ["Bank", e.bank_account_number ? `${e.bank_name ?? ""} •••• ${e.bank_account_number.slice(-4)}` : "—"]] as [string, string][]).map(([k, v]) => (
              <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
            ))}
          </dl>
        </Panel>
        <div className="space-y-6">
          <Panel title="Salary structure">
            {!salary ? <EmptyState title="No salary structure assigned" /> : (
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Basic</dt><dd>{inr(Number(salary.basic_salary))}</dd>
                <dt className="text-muted-foreground">HRA</dt><dd>{inr(Number(salary.hra))}</dd>
                <dt className="text-muted-foreground">Allowances</dt><dd>{inr(Number(salary.special_allowance) + Number(salary.conveyance_allowance) + Number(salary.medical_allowance) + Number(salary.other_allowances))}</dd>
                <dt className="text-muted-foreground">Annual CTC</dt><dd className="font-semibold">{inr(Number(salary.annual_ctc))}</dd>
              </dl>
            )}
          </Panel>
          <Panel title="Update details">
            <form className="space-y-3" onSubmit={(ev) => { ev.preventDefault(); save.mutate(); }}>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(ev) => setForm({ ...form, phone: ev.target.value })} /></div>
              <div className="space-y-1.5"><Label>Work location</Label><Input value={form.work_location} onChange={(ev) => setForm({ ...form, work_location: ev.target.value })} /></div>
              <Button disabled={save.isPending}>Save changes</Button>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
