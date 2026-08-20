import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listDocuments, uploadDocumentFile, getDocumentLink, listEmployees } from "@/lib/hr.functions";
import { PageHeader, Panel, EmptyState, LoadingRows } from "@/components/hr/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMe } from "@/hooks/use-hr";

export const Route = createFileRoute("/_authenticated/portal/documents")({ component: Documents });

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Unable to read the file"));
    reader.readAsDataURL(file);
  });
}

function Documents() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const listFn = useServerFn(listDocuments);
  const uploadFn = useServerFn(uploadDocumentFile);
  const linkFn = useServerFn(getDocumentLink);
  const employeesFn = useServerFn(listEmployees);

  const { data, isLoading } = useQuery({ queryKey: ["hr", "documents"], queryFn: () => listFn() });
  const { data: employees } = useQuery({
    queryKey: ["hr", "employees"], queryFn: () => employeesFn(), enabled: !!me?.isStaff,
  });

  const [form, setForm] = useState({ title: "", document_type: "Payslip", employee_id: "", is_company_wide: false });
  const [file, setFile] = useState<File | null>(null);

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a file to upload");
      if (!form.is_company_wide && !form.employee_id) throw new Error("Select an employee");
      const file_base64 = await toBase64(file);
      return uploadFn({
        data: {
          title: form.title,
          document_type: form.document_type,
          employee_id: form.is_company_wide ? null : form.employee_id,
          is_company_wide: form.is_company_wide,
          file_name: file.name,
          file_base64,
          content_type: file.type || "application/octet-stream",
        },
      });
    },
    onSuccess: () => {
      toast.success("Document uploaded");
      setFile(null);
      setForm({ title: "", document_type: "Payslip", employee_id: "", is_company_wide: false });
      qc.invalidateQueries({ queryKey: ["hr", "documents"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function open(id: string) {
    try {
      const { url } = await linkFn({ data: { id } });
      window.open(url, "_blank", "noreferrer");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader title="Documents" description="Paychecks, payslips, policies and your personal letters — visible only to you." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Available documents">
            {isLoading ? <LoadingRows /> : !data || data.length === 0 ? <EmptyState title="No documents shared yet" /> : (
              <ul className="divide-y">
                {data.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.document_type} · {d.is_company_wide ? "Company-wide" : "Personal"} · {new Date(d.uploaded_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <button onClick={() => open(d.id)} className="text-xs font-semibold text-primary">Open</button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        {me?.isStaff && (
          <Panel title="Upload document">
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); upload.mutate(); }}>
              <div className="space-y-1.5"><Label>Title</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Type</Label>
                <select className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })}>
                  {["Payslip", "Paycheck", "Offer letter", "ID proof", "Policy", "Other"].map((t) => <option key={t}>{t}</option>)}
                </select></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_company_wide}
                  onChange={(e) => setForm({ ...form, is_company_wide: e.target.checked })} />
                Company-wide (visible to all employees)
              </label>
              {!form.is_company_wide && (
                <div className="space-y-1.5"><Label>Employee</Label>
                  <select className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
                    <option value="">Select employee…</option>
                    {(employees ?? []).map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.employee_code} — {emp.first_name} {emp.last_name}</option>
                    ))}
                  </select></div>
              )}
              <div className="space-y-1.5"><Label>File</Label>
                <Input type="file" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
              <Button className="w-full" disabled={upload.isPending}>{upload.isPending ? "Uploading…" : "Upload document"}</Button>
            </form>
          </Panel>
        )}
      </div>
    </>
  );
}
