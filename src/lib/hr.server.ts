import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type DB = SupabaseClient<Database>;

/** Fixed administrator credentials for the admin portal. */
export const ADMIN_USERNAME = "Admin";
export const ADMIN_PASSWORD = "Bofa1234$$";
export const ADMIN_EMAIL = "admin@progmentsolution.com";

export type Viewer = {
  userId: string;
  role: "admin" | "hr" | "employee";
  isStaff: boolean;
  employee: Database["public"]["Tables"]["employees"]["Row"] | null;
};

/** Links a newly signed-in user to an employee record, assigns a role and an approval record. */
export async function provisionAccount(userId: string, email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const lower = email.toLowerCase();
  const isAdminAccount = lower === ADMIN_EMAIL;

  const { data: existingRoles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  if (!existingRoles || existingRoles.length === 0) {
    const { data: employee } = await supabaseAdmin
      .from("employees").select("id, user_id").eq("email", lower).maybeSingle();
    if (employee && !employee.user_id) {
      await supabaseAdmin.from("employees").update({ user_id: userId }).eq("id", employee.id);
    }
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: isAdminAccount ? "admin" : "employee" });
  }

  const { data: account } = await supabaseAdmin
    .from("portal_accounts").select("id, status").eq("user_id", userId).maybeSingle();
  if (!account) {
    await supabaseAdmin.from("portal_accounts").insert({
      user_id: userId, email: lower,
      status: isAdminAccount ? "approved" : "pending",
      decided_at: isAdminAccount ? new Date().toISOString() : null,
    });
  }
}

/** Creates (or repairs) the single fixed administrator account. Returns its email. */
export async function ensureAdminUser() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let userId: string | null = null;

  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL, password: ADMIN_PASSWORD, email_confirm: true,
  });
  if (created?.user) userId = created.user.id;

  if (!userId) {
    if (error && !/already|registered|exists/i.test(error.message)) throw new Error(error.message);
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const found = list?.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
    if (!found) throw new Error("Unable to prepare the administrator account");
    userId = found.id;
    await supabaseAdmin.auth.admin.updateUserById(userId, { password: ADMIN_PASSWORD, email_confirm: true });
  }

  const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin");
  if (!roles || roles.length === 0) {
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
  }
  const { data: account } = await supabaseAdmin.from("portal_accounts").select("id").eq("user_id", userId).maybeSingle();
  if (!account) {
    await supabaseAdmin.from("portal_accounts").insert({
      user_id: userId, email: ADMIN_EMAIL, status: "approved", decided_at: new Date().toISOString(),
    });
  } else {
    await supabaseAdmin.from("portal_accounts").update({ status: "approved" }).eq("id", account.id);
  }
  return ADMIN_EMAIL;
}

export async function getAccountStatus(supabase: DB, userId: string): Promise<"pending" | "approved" | "rejected"> {
  const { data } = await supabase.from("portal_accounts").select("status").eq("user_id", userId).maybeSingle();
  return (data?.status as "pending" | "approved" | "rejected") ?? "pending";
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
