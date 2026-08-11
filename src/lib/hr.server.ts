import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type DB = SupabaseClient<Database>;

export type Viewer = {
  userId: string;
  role: "admin" | "hr" | "employee";
  isStaff: boolean;
  employee: Database["public"]["Tables"]["employees"]["Row"] | null;
};

/** Links a newly signed-in user to an employee record and assigns a role. */
export async function provisionAccount(userId: string, email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existingRoles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  if (existingRoles && existingRoles.length > 0) return;

  const { data: employee } = await supabaseAdmin
    .from("employees").select("id, user_id").eq("email", email.toLowerCase()).maybeSingle();

  let role: "admin" | "employee" = "employee";
  if (!employee) {
    const { count } = await supabaseAdmin
      .from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
    role = (count ?? 0) === 0 ? "admin" : "employee";
  } else if (!employee.user_id) {
    await supabaseAdmin.from("employees").update({ user_id: userId }).eq("id", employee.id);
  }
  await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
}

export async function getViewer(supabase: DB, userId: string): Promise<Viewer> {
  const [{ data: roles }, { data: employee }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("employees").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  const list = (roles ?? []).map((r) => r.role);
  const role = list.includes("admin") ? "admin" : list.includes("hr") ? "hr" : "employee";
  return { userId, role, isStaff: role === "admin" || role === "hr", employee: employee ?? null };
}

export async function requireStaff(supabase: DB, userId: string): Promise<Viewer> {
  const viewer = await getViewer(supabase, userId);
  if (!viewer.isStaff) throw new Error("Forbidden: administrator access required");
  return viewer;
}

export async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function audit(userId: string, action: string, entity: string, entityId?: string, metadata?: unknown) {
  const db = await admin();
  await db.from("audit_logs").insert({
    user_id: userId, action, entity,
    entity_id: entityId ?? null,
    metadata: (metadata ?? null) as never,
  });
}
