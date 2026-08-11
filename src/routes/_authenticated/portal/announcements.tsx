import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listAnnouncements, createAnnouncement } from "@/lib/hr.functions";
import { PageHeader, Panel, EmptyState, LoadingRows } from "@/components/hr/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/use-hr";

export const Route = createFileRoute("/_authenticated/portal/announcements")({ component: Announcements });

function Announcements() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const listFn = useServerFn(listAnnouncements);
  const createFn = useServerFn(createAnnouncement);
  const { data, isLoading } = useQuery({ queryKey: ["hr", "announcements"], queryFn: () => listFn() });
  const [form, setForm] = useState({ title: "", content: "" });

  const create = useMutation({
    mutationFn: () => createFn({ data: form }),
    onSuccess: () => { toast.success("Announcement published"); setForm({ title: "", content: "" }); qc.invalidateQueries({ queryKey: ["hr", "announcements"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Announcements" description="Company-wide updates from the leadership and HR team." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Latest">
            {isLoading ? <LoadingRows /> : !data || data.length === 0 ? <EmptyState title="No announcements yet" /> : (
              <ul className="space-y-5">
                {data.map((a) => (
                  <li key={a.id} className="border-l-2 border-primary pl-4">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">{new Date(a.published_at).toLocaleDateString("en-IN")}</p>
                    <p className="text-sm whitespace-pre-line">{a.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        {me?.isStaff && (
          <Panel title="Publish announcement">
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
              <div className="space-y-1.5"><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Message</Label><Textarea rows={6} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
              <Button className="w-full" disabled={create.isPending}>Publish</Button>
            </form>
          </Panel>
        )}
      </div>
    </>
  );
}
