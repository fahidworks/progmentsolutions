import { z } from "zod";

export const employeeSchema = z.object({
  id: z.string().uuid().optional(),
  employee_code: z.string().min(1).max(30),
  first_name: z.string().min(1).max(60),
  last_name: z.string().min(1).max(60),
  email: z.string().email().max(160),
  phone: z.string().max(30).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  joining_date: z.string(),
  department_id: z.string().uuid().optional().nullable(),
  designation: z.string().max(120).optional().nullable(),
  employment_type: z.string().max(40).default("Full-time"),
  reporting_manager: z.string().max(120).optional().nullable(),
  work_location: z.string().max(120).optional().nullable(),
  bank_name: z.string().max(120).optional().nullable(),
  bank_account_number: z.string().max(40).optional().nullable(),
  bank_ifsc: z.string().max(20).optional().nullable(),
  pan: z.string().max(20).optional().nullable(),
  uan: z.string().max(30).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});
export type EmployeeInput = z.infer<typeof employeeSchema>;

export const salarySchema = z.object({
  employee_id: z.string().uuid(),
  basic_salary: z.number().min(0),
  hra: z.number().min(0),
  special_allowance: z.number().min(0),
  conveyance_allowance: z.number().min(0),
  medical_allowance: z.number().min(0),
  other_allowances: z.number().min(0),
  pf: z.number().min(0),
  professional_tax: z.number().min(0),
  tds: z.number().min(0),
  other_deductions: z.number().min(0),
  variable_pay: z.number().min(0).default(0),
  effective_from: z.string(),
});
export type SalaryInput = z.infer<typeof salarySchema>;

export const periodSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

export const leaveApplySchema = z.object({
  leave_type_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  reason: z.string().max(1000).optional().default(""),
});

export const profileUpdateSchema = z.object({
  phone: z.string().max(30).optional().nullable(),
  work_location: z.string().max(120).optional().nullable(),
  photo_url: z.string().url().max(500).optional().nullable(),
});
