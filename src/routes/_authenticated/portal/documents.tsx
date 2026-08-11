import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listDocuments, saveDocument } from "@/lib/hr.functions";
import { PageHeader, Panel, EmptyState, LoadingRows } from "@/components/hr/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMe } from "@/hooks/use-hr";

export const Route = createFileRoute("/_authenticated/portal/documents")({ component: Documents });

function Documents() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const listFn = useServerFn(listDocuments);
  const saveFn = useServerFn(saveDocument);
  const { data, isLoading } = useQuery({ queryKey: ["hr", "documents"], queryFn: () => listFn() });
  const [form, setForm] = useState({ title: "", document_type: "Policy", file_path: "", is_company_wide: true });

  const save = useMutation({
    mutationFn: () => saveFn({ data: form }),
    onSuccess: () => { toast.success("Document added"); qc.invalidateQueries({ queryKey: ["hr", "documents"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Documents" description="Company policies, HR documents and your personal letters." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Available documents">
            {isLoading ? <LoadingRows /> : !data || data.length === 0 ? <EmptyState title="No documents shared yet" /> : (
              <ul className="divide-y">
                {data.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.document_type} · {d.is_company_wide ? "Company-wide" : "Personal"}</p>
                    </div>
                    <a href={d.file_path} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary">Open</a>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        {me?.isStaff && (
          <Panel title="Add document">
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
              <div className="space-y-1.5"><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Type</Label><Input required value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Link</Label><Input required placeholder="https://…" value={form.file_path} onChange={(e) => setForm({ ...form, file_path: e.target.value })} /></div>
              <Button className="w-full" disabled={save.isPending}>Add document</Button>
            </form>
          </Panel>
        )}
      </div>
    </>
  );
}
