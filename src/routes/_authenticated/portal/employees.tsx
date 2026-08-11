import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listEmployees, listDepartments, saveEmployee, setEmployeeStatus } from "@/lib/hr.functions";
import { PageHeader, Panel, EmptyState, LoadingRows, StatusBadge } from "@/components/hr/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/portal/employees")({ component: Employees });

const blank = {
  employee_code: "", first_name: "", last_name: "", email: "", phone: "",
  joining_date: new Date().toISOString().slice(0, 10), designation: "", employment_type: "Full-time",
  department_id: "", work_location: "Bangalore", status: "active" as const,
};

function Employees() {
  const qc = useQueryClient();
  const listFn = useServerFn(listEmployees);
  const deptFn = useServerFn(listDepartments);
  const saveFn = useServerFn(saveEmployee);
  const statusFn = useServerFn(setEmployeeStatus);
  const { data, isLoading, error } = useQuery({ queryKey: ["hr", "employees"], queryFn: () => listFn() });
  const { data: departments } = useQuery({ queryKey: ["hr", "departments"], queryFn: () => deptFn() });
  const [q, setQ] = useState("");
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((e) =>
      !term || `${e.first_name} ${e.last_name} ${e.employee_code} ${e.email} ${e.designation ?? ""}`.toLowerCase().includes(term));
  }, [data, q]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: { ...form, department_id: form.department_id || null } }),
    onSuccess: () => { toast.success("Employee saved"); setForm(blank); setOpen(false); qc.invalidateQueries({ queryKey: ["hr", "employees"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: (v: { id: string; status: "active" | "inactive" }) => statusFn({ data: v }),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["hr", "employees"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (error) return <EmptyState title="Administrator access required" hint={(error as Error).message} />;

  return (
    <>
      <PageHeader
        title="Employees"
        description="Manage the employee directory."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>Add employee</Button></DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add employee</DialogTitle></DialogHeader>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
                {([["employee_code", "Employee ID"], ["first_name", "First name"], ["last_name", "Last name"],
                   ["email", "Email"], ["phone", "Phone"], ["designation", "Designation"],
                   ["joining_date", "Joining date"], ["employment_type", "Employment type"], ["work_location", "Work location"]] as const).map(([k, label]) => (
                  <div className="space-y-1.5" key={k}>
                    <Label>{label}</Label>
                    <Input
                      type={k === "joining_date" ? "date" : k === "email" ? "email" : "text"}
                      required={["employee_code", "first_name", "last_name", "email", "joining_date"].includes(k)}
                      value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                    <option value="">Unassigned</option>
                    {(departments ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2"><Button className="w-full" disabled={save.isPending}>Save employee</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Panel title={`Directory (${rows.length})`} action={<Input placeholder="Search…" className="h-8 w-48" value={q} onChange={(e) => setQ(e.target.value)} />}>
        {isLoading ? <LoadingRows /> : rows.length === 0 ? <EmptyState title="No employees found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="py-2">ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Status</th><th></th></tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 font-medium">{e.employee_code}</td>
                    <td>{e.first_name} {e.last_name}<div className="text-xs text-muted-foreground">{e.email}</div></td>
                    <td>{(e.departments as { name: string } | null)?.name ?? "—"}</td>
                    <td>{e.designation ?? "—"}</td>
                    <td><StatusBadge status={e.status} /></td>
                    <td className="text-right">
                      <Button size="sm" variant="outline" onClick={() => toggle.mutate({ id: e.id, status: e.status === "active" ? "inactive" : "active" })}>
                        {e.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
