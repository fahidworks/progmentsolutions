import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listAccounts, decideAccount } from "@/lib/hr.functions";
import { PageHeader, Panel, EmptyState, LoadingRows, StatusBadge } from "@/components/hr/ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/portal/approvals")({ component: Approvals });

function Approvals() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAccounts);
  const decideFn = useServerFn(decideAccount);
  const { data, isLoading, error } = useQuery({ queryKey: ["hr", "accounts"], queryFn: () => listFn() });

  const decide = useMutation({
    mutationFn: (v: { id: string; status: "approved" | "rejected" }) => decideFn({ data: v }),
    onSuccess: () => { toast.success("Account updated"); qc.invalidateQueries({ queryKey: ["hr", "accounts"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (error) return <EmptyState title="Administrator access required" hint={(error as Error).message} />;

  const pending = (data ?? []).filter((a) => a.status === "pending");
  const decided = (data ?? []).filter((a) => a.status !== "pending");

  return (
    <>
      <PageHeader title="Account approvals" description="Approve or reject portal sign-ups before employees can access their records." />
      {isLoading ? <LoadingRows rows={5} /> : (
        <div className="grid gap-6">
          <Panel title={`Pending requests (${pending.length})`}>
            {pending.length === 0 ? <EmptyState title="No pending requests" /> : (
              <ul className="divide-y">
                {pending.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">{a.email}</p>
                      <p className="text-xs text-muted-foreground">Requested {new Date(a.created_at).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={decide.isPending} onClick={() => decide.mutate({ id: a.id, status: "approved" })}>Approve</Button>
                      <Button size="sm" variant="outline" disabled={decide.isPending} onClick={() => decide.mutate({ id: a.id, status: "rejected" })}>Reject</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Decided accounts">
            {decided.length === 0 ? <EmptyState title="Nothing decided yet" /> : (
              <ul className="divide-y">
                {decided.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">{a.email}</p>
                      <p className="text-xs text-muted-foreground">{a.decided_at ? new Date(a.decided_at).toLocaleString("en-IN") : "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      {a.status === "rejected"
                        ? <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: a.id, status: "approved" })}>Approve</Button>
                        : <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: a.id, status: "rejected" })}>Revoke</Button>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
