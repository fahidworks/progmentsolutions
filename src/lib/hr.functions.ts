import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { employeeSchema, salarySchema, periodSchema, leaveApplySchema, profileUpdateSchema } from "./hr.schemas";
import { z } from "zod";

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getViewer, provisionAccount, getAccountStatus } = await import("./hr.server");
    const email = String((context.claims as Record<string, unknown>)["email"] ?? "");
    await provisionAccount(context.userId, email);
    const viewer = await getViewer(context.supabase, context.userId);
    const accountStatus = viewer.isStaff ? "approved" : await getAccountStatus(context.supabase, context.userId);
    return {
      userId: viewer.userId, email, role: viewer.role, isStaff: viewer.isStaff,
      employee: viewer.employee, accountStatus,
    };
  });

/** Verifies the fixed administrator credentials and returns the email to sign in with. */
export const adminSignIn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ username: z.string().max(120), password: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { ADMIN_USERNAME, ADMIN_PASSWORD, ensureAdminUser } = await import("./hr.server");
    if (data.username.trim() !== ADMIN_USERNAME || data.password !== ADMIN_PASSWORD) {
      throw new Error("Wrong username or password — access denied");
    }
    const email = await ensureAdminUser();
    return { email };
  });

export const listAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("portal_accounts").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const decideAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const { data: account, error } = await db.from("portal_accounts")
      .update({ status: data.status, decided_by: context.userId, decided_at: new Date().toISOString() })
      .eq("id", data.id).select("user_id, email").single();
    if (error) throw new Error(error.message);
    if (data.status === "approved" && account) {
      const { data: employee } = await db.from("employees")
        .select("id, user_id").eq("email", account.email.toLowerCase()).maybeSingle();
      if (employee && !employee.user_id) {
        await db.from("employees").update({ user_id: account.user_id }).eq("id", employee.id);
      }
    }
    await audit(context.userId, `account.${data.status}`, "portal_accounts", data.id, { email: account?.email });
    return { ok: true };
  });

/** Staff upload of a payslip / paycheck / document file for an employee (or company-wide). */
export const uploadDocumentFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    title: z.string().min(1).max(160),
    document_type: z.string().min(1).max(60),
    employee_id: z.string().uuid().optional().nullable(),
    is_company_wide: z.boolean().default(false),
    file_name: z.string().min(1).max(200),
    file_base64: z.string().min(1).max(14_000_000),
    content_type: z.string().max(120).default("application/octet-stream"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const bytes = Uint8Array.from(atob(data.file_base64), (c) => c.charCodeAt(0));
    const safe = data.file_name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${data.is_company_wide ? "company" : data.employee_id}/${Date.now()}-${safe}`;
    const { error: upErr } = await db.storage.from("employee-documents")
      .upload(path, bytes, { contentType: data.content_type, upsert: false });
    if (upErr) throw new Error(upErr.message);
    const { error } = await db.from("documents").insert({
      title: data.title, document_type: data.document_type,
      employee_id: data.is_company_wide ? null : data.employee_id ?? null,
      is_company_wide: data.is_company_wide, file_path: path, uploaded_by: context.userId,
    });
    if (error) throw new Error(error.message);
    await audit(context.userId, "document.uploaded", "documents", data.employee_id ?? undefined, { title: data.title });
    return { ok: true };
  });

/** Returns a short-lived download link, only if the caller is allowed to see the document. */
export const getDocumentLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireApproved, admin } = await import("./hr.server");
    await requireApproved(context.supabase, context.userId);
    const { data: doc } = await context.supabase.from("documents").select("file_path").eq("id", data.id).maybeSingle();
    if (!doc) throw new Error("Document not available");
    if (/^https?:\/\//i.test(doc.file_path)) return { url: doc.file_path };
    const db = await admin();
    const { data: signed, error } = await db.storage.from("employee-documents").createSignedUrl(doc.file_path, 300);
    if (error || !signed) throw new Error(error?.message ?? "Unable to prepare download");
    return { url: signed.signedUrl };
  });

export const listDepartments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("departments").select("*").order("name");
    return data ?? [];
  });

export const listEmployees = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("employees")
      .select("*, departments(name)")
      .order("employee_code");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getEmployee = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: employee, error } = await context.supabase
      .from("employees").select("*, departments(name)").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!employee) throw new Error("Employee not found");
    const { data: salary } = await context.supabase
      .from("salary_structures").select("*").eq("employee_id", data.id)
      .order("effective_from", { ascending: false }).limit(1).maybeSingle();
    return { employee, salary: salary ?? null };
  });

export const saveEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => employeeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const payload = { ...data, email: data.email.toLowerCase() };
    if (data.id) {
      const { error } = await db.from("employees").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      await audit(context.userId, "employee.updated", "employees", data.id);
      return { id: data.id };
    }
    const { data: created, error } = await db.from("employees").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    await audit(context.userId, "employee.created", "employees", created.id, { code: data.employee_code });
    return { id: created.id };
  });

export const setEmployeeStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["active", "inactive"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const { error } = await db.from("employees").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.userId, `employee.${data.status === "active" ? "activated" : "deactivated"}`, "employees", data.id);
    return { ok: true };
  });

export const saveSalaryStructure = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => salarySchema.parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const gross = data.basic_salary + data.hra + data.special_allowance + data.conveyance_allowance + data.medical_allowance + data.other_allowances;
    await db.from("salary_structures").update({ effective_to: data.effective_from })
      .eq("employee_id", data.employee_id).is("effective_to", null);
    const { error } = await db.from("salary_structures").insert({ ...data, annual_ctc: gross * 12 + data.variable_pay });
    if (error) throw new Error(error.message);
    await audit(context.userId, "salary.revised", "salary_structures", data.employee_id, { gross });
    return { ok: true };
  });

export const getMySalary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getViewer } = await import("./hr.server");
    const viewer = await getViewer(context.supabase, context.userId);
    if (!viewer.employee) return null;
    const { data } = await context.supabase.from("salary_structures").select("*")
      .eq("employee_id", viewer.employee.id).order("effective_from", { ascending: false }).limit(1).maybeSingle();
    return data ?? null;
  });

export const listPayroll = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => periodSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("payrolls")
      .select("*, employees(employee_code, first_name, last_name, departments(name))")
      .eq("payroll_year", data.year).eq("payroll_month", data.month);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const calculatePayroll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => periodSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    const { computePayroll } = await import("./payroll");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const { data: employees } = await db.from("employees").select("id").eq("status", "active");
    let created = 0;
    for (const emp of employees ?? []) {
      const { data: existing } = await db.from("payrolls").select("id, locked")
        .eq("employee_id", emp.id).eq("payroll_year", data.year).eq("payroll_month", data.month).maybeSingle();
      if (existing?.locked) continue;
      const { data: salary } = await db.from("salary_structures").select("*")
        .eq("employee_id", emp.id).order("effective_from", { ascending: false }).limit(1).maybeSingle();
      if (!salary) continue;
      const calc = computePayroll(salary, salary);
      const row = {
        employee_id: emp.id, payroll_month: data.month, payroll_year: data.year,
        gross_salary: calc.gross, total_deductions: calc.totalDeductions, net_salary: calc.net,
        status: "processed", processed_at: new Date().toISOString(),
      };
      let payrollId = existing?.id;
      if (payrollId) {
        await db.from("payrolls").update(row).eq("id", payrollId);
        await db.from("payroll_items").delete().eq("payroll_id", payrollId);
      } else {
        const { data: ins, error } = await db.from("payrolls").insert(row).select("id").single();
        if (error) continue;
        payrollId = ins.id;
      }
      await db.from("payroll_items").insert([
        ...calc.earnings.map((x) => ({ payroll_id: payrollId!, component_name: x.name, component_type: "earning", amount: x.amount })),
        ...calc.deductions.map((x) => ({ payroll_id: payrollId!, component_name: x.name, component_type: "deduction", amount: x.amount })),
      ]);
      created += 1;
    }
    await audit(context.userId, "payroll.calculated", "payrolls", undefined, { ...data, count: created });
    return { processed: created };
  });

export const adjustPayroll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), bonus: z.number().min(0), extra_deduction: z.number().min(0) }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const { data: pr } = await db.from("payrolls").select("*").eq("id", data.id).single();
    if (!pr) throw new Error("Payroll not found");
    if (pr.locked) throw new Error("Payroll is locked and cannot be modified");
    const baseGross = Number(pr.gross_salary) - Number(pr.bonus);
    const gross = baseGross + data.bonus;
    const deductions = Number(pr.total_deductions) + data.extra_deduction;
    await db.from("payrolls").update({
      bonus: data.bonus, gross_salary: gross, total_deductions: deductions, net_salary: gross - deductions,
    }).eq("id", data.id);
    await db.from("payroll_items").delete().eq("payroll_id", data.id).eq("component_name", "Bonus");
    if (data.bonus > 0) {
      await db.from("payroll_items").insert({ payroll_id: data.id, component_name: "Bonus", component_type: "earning", amount: data.bonus });
    }
    if (data.extra_deduction > 0) {
      await db.from("payroll_items").insert({ payroll_id: data.id, component_name: "Other Deductions", component_type: "deduction", amount: data.extra_deduction });
    }
    await audit(context.userId, "payroll.adjusted", "payrolls", data.id, data);
    return { ok: true };
  });

export const approvePayroll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => periodSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const { data: rows } = await db.from("payrolls").select("id, employee_id, locked")
      .eq("payroll_year", data.year).eq("payroll_month", data.month);
    let generated = 0;
    for (const pr of rows ?? []) {
      if (pr.locked) continue;
      await db.from("payrolls").update({ status: "approved", locked: true, approved_by: context.userId }).eq("id", pr.id);
      const { data: emp } = await db.from("employees").select("employee_code").eq("id", pr.employee_id).single();
      const number = `PS-${data.year}${String(data.month).padStart(2, "0")}-${emp?.employee_code ?? "NA"}`;
      const { data: slip } = await db.from("payslips").select("id").eq("payroll_id", pr.id).maybeSingle();
      if (!slip) {
        await db.from("payslips").insert({ payroll_id: pr.id, employee_id: pr.employee_id, payslip_number: number });
      }
      generated += 1;
    }
    await audit(context.userId, "payroll.approved", "payrolls", undefined, { ...data, count: generated });
    return { approved: generated };
  });

export const listMyPayslips = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireApproved } = await import("./hr.server");
    await requireApproved(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("payslips")
      .select("*, payrolls(payroll_month, payroll_year, gross_salary, total_deductions, net_salary, status)")
      .order("generated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getPayslip = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ payrollId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: payroll, error } = await context.supabase
      .from("payrolls")
      .select("*, employees(*, departments(name)), payslips(payslip_number, generated_at)")
      .eq("id", data.payrollId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!payroll) throw new Error("Payslip not available");
    const { data: items } = await context.supabase.from("payroll_items").select("*").eq("payroll_id", data.payrollId);
    return { payroll, items: items ?? [] };
  });

export const listAttendance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => periodSchema.extend({ employeeId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const start = `${data.year}-${String(data.month).padStart(2, "0")}-01`;
    const end = new Date(Date.UTC(data.year, data.month, 0)).toISOString().slice(0, 10);
    let q = context.supabase.from("attendance").select("*, employees(employee_code, first_name, last_name)")
      .gte("attendance_date", start).lte("attendance_date", end).order("attendance_date");
    if (data.employeeId) q = q.eq("employee_id", data.employeeId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const markAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    employee_id: z.string().uuid(), attendance_date: z.string(),
    status: z.enum(["present", "absent", "half_day", "leave", "holiday", "wfh"]),
    check_in: z.string().optional().nullable(), check_out: z.string().optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const { error } = await db.from("attendance").upsert({
      employee_id: data.employee_id, attendance_date: data.attendance_date, status: data.status,
      check_in: data.check_in || null, check_out: data.check_out || null,
    }, { onConflict: "employee_id,attendance_date" });
    if (error) throw new Error(error.message);
    await audit(context.userId, "attendance.marked", "attendance", data.employee_id, data);
    return { ok: true };
  });

export const listLeaveTypes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("leave_types").select("*").order("name");
    return data ?? [];
  });

export const listLeaves = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("leave_requests")
      .select("*, leave_types(name), employees(employee_code, first_name, last_name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const applyLeave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => leaveApplySchema.parse(d))
  .handler(async ({ data, context }) => {
    const { getViewer, admin, audit } = await import("./hr.server");
    const viewer = await getViewer(context.supabase, context.userId);
    if (!viewer.employee) throw new Error("No employee record is linked to your account");
    const days = Math.max(1, Math.round((Date.parse(data.end_date) - Date.parse(data.start_date)) / 86400000) + 1);
    const db = await admin();
    const { error } = await db.from("leave_requests").insert({
      employee_id: viewer.employee.id, leave_type_id: data.leave_type_id,
      start_date: data.start_date, end_date: data.end_date, days, reason: data.reason, status: "pending",
    });
    if (error) throw new Error(error.message);
    await audit(context.userId, "leave.applied", "leave_requests", viewer.employee.id, { days });
    return { ok: true };
  });

export const decideLeave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const { error } = await db.from("leave_requests")
      .update({ status: data.status, approved_by: context.userId }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.userId, `leave.${data.status}`, "leave_requests", data.id);
    return { ok: true };
  });

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireApproved } = await import("./hr.server");
    await requireApproved(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("documents").select("*").order("uploaded_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    title: z.string().min(1).max(160), document_type: z.string().max(60),
    file_path: z.string().min(1).max(500),
    employee_id: z.string().uuid().optional().nullable(), is_company_wide: z.boolean().default(false),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const { error } = await db.from("documents").insert({ ...data, uploaded_by: context.userId });
    if (error) throw new Error(error.message);
    await audit(context.userId, "document.uploaded", "documents", undefined, { title: data.title });
    return { ok: true };
  });

export const listAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("announcements").select("*").order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ title: z.string().min(2).max(160), content: z.string().min(2).max(5000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireStaff, admin, audit } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const db = await admin();
    const { error } = await db.from("announcements").insert({ ...data, published_by: context.userId });
    if (error) throw new Error(error.message);
    await audit(context.userId, "announcement.published", "announcements", undefined, { title: data.title });
    return { ok: true };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => profileUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { getViewer, admin, audit } = await import("./hr.server");
    const viewer = await getViewer(context.supabase, context.userId);
    if (!viewer.employee) throw new Error("No employee record is linked to your account");
    const db = await admin();
    const { error } = await db.from("employees").update({
      phone: data.phone ?? null, work_location: data.work_location ?? null, photo_url: data.photo_url ?? null,
    }).eq("id", viewer.employee.id);
    if (error) throw new Error(error.message);
    await audit(context.userId, "profile.updated", "employees", viewer.employee.id);
    return { ok: true };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./hr.server");
    await requireStaff(context.supabase, context.userId);
    const now = new Date();
    const [{ data: employees }, { data: payrolls }, { data: leaves }, { data: logs }] = await Promise.all([
      context.supabase.from("employees").select("id, status, department_id, departments(name)"),
      context.supabase.from("payrolls").select("payroll_month, payroll_year, gross_salary, net_salary, status"),
      context.supabase.from("leave_requests").select("id, status, start_date, end_date"),
      context.supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(8),
    ]);
    const emps = employees ?? [];
    const prs = payrolls ?? [];
    const month = now.getMonth() + 1, year = now.getFullYear();
    const thisMonth = prs.filter((p) => p.payroll_month === month && p.payroll_year === year);
    const byDept = new Map<string, number>();
    for (const e of emps) {
      const name = (e.departments as { name?: string } | null)?.name ?? "Unassigned";
      byDept.set(name, (byDept.get(name) ?? 0) + 1);
    }
    const byMonth = new Map<string, number>();
    for (const p of prs) {
      const key = `${p.payroll_year}-${String(p.payroll_month).padStart(2, "0")}`;
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(p.net_salary));
    }
    const today = now.toISOString().slice(0, 10);
    return {
      totalEmployees: emps.length,
      activeEmployees: emps.filter((e) => e.status === "active").length,
      payrollThisMonth: thisMonth.length,
      salaryExpenseThisMonth: thisMonth.reduce((s, p) => s + Number(p.net_salary), 0),
      pendingPayroll: thisMonth.filter((p) => p.status !== "approved").length,
      onLeaveToday: (leaves ?? []).filter((l) => l.status === "approved" && l.start_date <= today && l.end_date >= today).length,
      pendingLeaves: (leaves ?? []).filter((l) => l.status === "pending").length,
      departmentCounts: [...byDept.entries()].map(([name, value]) => ({ name, value })),
      monthlyExpense: [...byMonth.entries()].sort().map(([name, value]) => ({ name, value })),
      recentActivity: logs ?? [],
    };
  });

export const getEmployeeDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireApproved } = await import("./hr.server");
    const viewer = await requireApproved(context.supabase, context.userId);
    if (!viewer.employee) return null;
    const now = new Date();
    const month = now.getMonth() + 1, year = now.getFullYear();
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
    const [{ data: payslips }, { data: attendance }, { data: leaves }, { data: types }, { data: announcements }] = await Promise.all([
      context.supabase.from("payslips").select("*, payrolls(payroll_month, payroll_year, net_salary)").order("generated_at", { ascending: false }).limit(6),
      context.supabase.from("attendance").select("status").gte("attendance_date", start).lte("attendance_date", end),
      context.supabase.from("leave_requests").select("days, status, leave_type_id").eq("status", "approved"),
      context.supabase.from("leave_types").select("*"),
      context.supabase.from("announcements").select("*").order("published_at", { ascending: false }).limit(3),
    ]);
    const totalAllowance = (types ?? []).reduce((s, t) => s + t.annual_limit, 0);
    const used = (leaves ?? []).reduce((s, l) => s + Number(l.days), 0);
    return {
      employee: viewer.employee,
      payslips: payslips ?? [],
      presentDays: (attendance ?? []).filter((a) => a.status === "present" || a.status === "wfh").length,
      leaveBalance: Math.max(0, totalAllowance - used),
      announcements: announcements ?? [],
    };
  });
