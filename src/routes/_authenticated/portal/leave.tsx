import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listLeaves, listLeaveTypes, applyLeave, decideLeave } from "@/lib/hr.functions";
import { PageHeader, Panel, EmptyState, LoadingRows, StatusBadge } from "@/components/hr/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/use-hr";

export const Route = createFileRoute("/_authenticated/portal/leave")({ component: LeavePage });

function LeavePage() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const listFn = useServerFn(listLeaves);
  const typesFn = useServerFn(listLeaveTypes);
  const applyFn = useServerFn(applyLeave);
  const decideFn = useServerFn(decideLeave);

  const { data: leaves, isLoading } = useQuery({ queryKey: ["hr", "leaves"], queryFn: () => listFn() });
  const { data: types } = useQuery({ queryKey: ["hr", "leaveTypes"], queryFn: () => typesFn() });
  const [form, setForm] = useState({ leave_type_id: "", start_date: "", end_date: "", reason: "" });

  const apply = useMutation({
    mutationFn: () => applyFn({ data: form }),
    onSuccess: () => { toast.success("Leave request submitted"); setForm({ leave_type_id: "", start_date: "", end_date: "", reason: "" }); qc.invalidateQueries({ queryKey: ["hr", "leaves"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const decide = useMutation({
    mutationFn: (v: { id: string; status: "approved" | "rejected" }) => decideFn({ data: v }),
    onSuccess: () => { toast.success("Leave updated"); qc.invalidateQueries({ queryKey: ["hr", "leaves"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Leave management" description="Apply for leave and track approval status." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Apply for leave">
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); apply.mutate(); }}>
            <div className="space-y-1.5">
              <Label>Leave type</Label>
              <select required className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={form.leave_type_id} onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}>
                <option value="">Select…</option>
                {(types ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><Label>From</Label><Input type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>To</Label><Input type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Reason</Label><Textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            <Button className="w-full" disabled={apply.isPending}>{apply.isPending ? "Submitting…" : "Submit request"}</Button>
          </form>
        </Panel>

        <div className="lg:col-span-2">
          <Panel title="Leave history">
            {isLoading ? <LoadingRows /> : !leaves || leaves.length === 0 ? <EmptyState title="No leave requests yet" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr><th className="py-2">Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Status</th>{me?.isStaff && <th></th>}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {leaves.map((l) => {
                      const e = l.employees as { first_name: string; last_name: string } | null;
                      return (
                        <tr key={l.id}>
                          <td className="py-2.5">{e ? `${e.first_name} ${e.last_name}` : "You"}</td>
                          <td>{(l.leave_types as { name: string } | null)?.name}</td>
                          <td>{l.start_date} → {l.end_date}</td>
                          <td>{l.days}</td>
                          <td><StatusBadge status={l.status} /></td>
                          {me?.isStaff && (
                            <td className="text-right space-x-1">
                              {l.status === "pending" && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: l.id, status: "approved" })}>Approve</Button>
                                  <Button size="sm" variant="ghost" onClick={() => decide.mutate({ id: l.id, status: "rejected" })}>Reject</Button>
                                </>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
