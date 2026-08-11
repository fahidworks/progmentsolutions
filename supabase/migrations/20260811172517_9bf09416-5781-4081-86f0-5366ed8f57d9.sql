
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','hr','employee');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','hr'));
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- DEPARTMENTS
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view departments" ON public.departments FOR SELECT TO authenticated USING (true);

-- EMPLOYEES
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  employee_code text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  date_of_birth date,
  joining_date date NOT NULL DEFAULT current_date,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  designation text,
  employment_type text NOT NULL DEFAULT 'Full-time',
  reporting_manager text,
  work_location text,
  bank_account_number text,
  bank_name text,
  bank_ifsc text,
  pan text,
  uan text,
  status text NOT NULL DEFAULT 'active',
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX employees_department_idx ON public.employees(department_id);
CREATE INDEX employees_status_idx ON public.employees(status);
GRANT SELECT ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.current_employee_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.employees WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE POLICY "Employees view own record, staff view all" ON public.employees
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- SALARY STRUCTURES
CREATE TABLE public.salary_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  basic_salary numeric(12,2) NOT NULL DEFAULT 0,
  hra numeric(12,2) NOT NULL DEFAULT 0,
  special_allowance numeric(12,2) NOT NULL DEFAULT 0,
  conveyance_allowance numeric(12,2) NOT NULL DEFAULT 0,
  medical_allowance numeric(12,2) NOT NULL DEFAULT 0,
  other_allowances numeric(12,2) NOT NULL DEFAULT 0,
  pf numeric(12,2) NOT NULL DEFAULT 0,
  professional_tax numeric(12,2) NOT NULL DEFAULT 0,
  tds numeric(12,2) NOT NULL DEFAULT 0,
  other_deductions numeric(12,2) NOT NULL DEFAULT 0,
  annual_ctc numeric(14,2) NOT NULL DEFAULT 0,
  variable_pay numeric(12,2) NOT NULL DEFAULT 0,
  effective_from date NOT NULL DEFAULT current_date,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX salary_structures_employee_idx ON public.salary_structures(employee_id);
GRANT SELECT ON public.salary_structures TO authenticated;
GRANT ALL ON public.salary_structures TO service_role;
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER salary_structures_updated_at BEFORE UPDATE ON public.salary_structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Own salary or staff" ON public.salary_structures
  FOR SELECT TO authenticated USING (employee_id = public.current_employee_id() OR public.is_staff(auth.uid()));

-- PAYROLLS
CREATE TABLE public.payrolls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  payroll_month int NOT NULL CHECK (payroll_month BETWEEN 1 AND 12),
  payroll_year int NOT NULL CHECK (payroll_year BETWEEN 2000 AND 2100),
  gross_salary numeric(12,2) NOT NULL DEFAULT 0,
  total_deductions numeric(12,2) NOT NULL DEFAULT 0,
  net_salary numeric(12,2) NOT NULL DEFAULT 0,
  bonus numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  locked boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, payroll_month, payroll_year)
);
CREATE INDEX payrolls_period_idx ON public.payrolls(payroll_year, payroll_month);
GRANT SELECT ON public.payrolls TO authenticated;
GRANT ALL ON public.payrolls TO service_role;
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER payrolls_updated_at BEFORE UPDATE ON public.payrolls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Own payroll or staff" ON public.payrolls
  FOR SELECT TO authenticated USING (employee_id = public.current_employee_id() OR public.is_staff(auth.uid()));

CREATE TABLE public.payroll_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id uuid NOT NULL REFERENCES public.payrolls(id) ON DELETE CASCADE,
  component_name text NOT NULL,
  component_type text NOT NULL CHECK (component_type IN ('earning','deduction')),
  amount numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payroll_items_payroll_idx ON public.payroll_items(payroll_id);
GRANT SELECT ON public.payroll_items TO authenticated;
GRANT ALL ON public.payroll_items TO service_role;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own payroll items or staff" ON public.payroll_items
  FOR SELECT TO authenticated USING (
    public.is_staff(auth.uid()) OR EXISTS (
      SELECT 1 FROM public.payrolls p WHERE p.id = payroll_id AND p.employee_id = public.current_employee_id()
    )
  );

-- PAYSLIPS
CREATE TABLE public.payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id uuid NOT NULL REFERENCES public.payrolls(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  payslip_number text NOT NULL UNIQUE,
  generated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payslips TO authenticated;
GRANT ALL ON public.payslips TO service_role;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own payslips or staff" ON public.payslips
  FOR SELECT TO authenticated USING (employee_id = public.current_employee_id() OR public.is_staff(auth.uid()));

-- ATTENDANCE
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  check_in time,
  check_out time,
  working_hours numeric(5,2),
  status text NOT NULL DEFAULT 'present',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, attendance_date)
);
CREATE INDEX attendance_date_idx ON public.attendance(attendance_date);
GRANT SELECT ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own attendance or staff" ON public.attendance
  FOR SELECT TO authenticated USING (employee_id = public.current_employee_id() OR public.is_staff(auth.uid()));

-- LEAVE
CREATE TABLE public.leave_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  annual_limit int NOT NULL DEFAULT 12,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.leave_types TO authenticated;
GRANT ALL ON public.leave_types TO service_role;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view leave types" ON public.leave_types FOR SELECT TO authenticated USING (true);

CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.leave_types(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days numeric(4,1) NOT NULL DEFAULT 1,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leave_requests_employee_idx ON public.leave_requests(employee_id);
GRANT SELECT ON public.leave_requests TO authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Own leave or staff" ON public.leave_requests
  FOR SELECT TO authenticated USING (employee_id = public.current_employee_id() OR public.is_staff(auth.uid()));

-- DOCUMENTS
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  document_type text NOT NULL DEFAULT 'other',
  file_path text NOT NULL,
  is_company_wide boolean NOT NULL DEFAULT false,
  uploaded_by uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own or company documents or staff" ON public.documents
  FOR SELECT TO authenticated USING (is_company_wide OR employee_id = public.current_employee_id() OR public.is_staff(auth.uid()));

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  published_by uuid,
  published_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can view announcements" ON public.announcements FOR SELECT TO authenticated USING (true);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_created_idx ON public.audit_logs(created_at DESC);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- SEED
INSERT INTO public.departments (name) VALUES ('Engineering'),('Design'),('Human Resources'),('Sales'),('Operations');
INSERT INTO public.leave_types (name, annual_limit) VALUES ('Casual Leave',12),('Sick Leave',10),('Earned Leave',15),('Unpaid Leave',0);

INSERT INTO public.employees (employee_code, first_name, last_name, email, phone, date_of_birth, joining_date, department_id, designation, employment_type, reporting_manager, work_location, bank_name, bank_account_number, bank_ifsc, pan, uan, status)
SELECT v.code, v.fn, v.ln, v.email, v.phone, v.dob::date, v.doj::date, d.id, v.desig, 'Full-time', v.mgr, 'Bangalore', 'HDFC Bank', v.acct, 'HDFC0001234', v.pan, v.uan, 'active'
FROM (VALUES
 ('PS001','Arjun','Sharma','arjun.sharma@progmentsolution.com','9876543201','1993-04-12','2021-06-01','Engineering','Senior Software Engineer','Priya Nair','50100123456701','ABCPS1201F','100200300401'),
 ('PS002','Priya','Nair','priya.nair@progmentsolution.com','9876543202','1989-09-23','2019-02-11','Engineering','Engineering Manager','Rahul Verma','50100123456702','ABCPS1202F','100200300402'),
 ('PS003','Rahul','Verma','rahul.verma@progmentsolution.com','9876543203','1986-01-05','2018-08-20','Operations','Director of Operations','Board','50100123456703','ABCPS1203F','100200300403'),
 ('PS004','Sneha','Iyer','sneha.iyer@progmentsolution.com','9876543204','1995-11-30','2022-03-14','Design','UI/UX Designer','Priya Nair','50100123456704','ABCPS1204F','100200300404'),
 ('PS005','Vikram','Singh','vikram.singh@progmentsolution.com','9876543205','1992-07-19','2020-10-05','Engineering','Backend Engineer','Priya Nair','50100123456705','ABCPS1205F','100200300405'),
 ('PS006','Ananya','Reddy','ananya.reddy@progmentsolution.com','9876543206','1994-02-08','2023-01-09','Human Resources','HR Executive','Rahul Verma','50100123456706','ABCPS1206F','100200300406'),
 ('PS007','Karthik','Menon','karthik.menon@progmentsolution.com','9876543207','1991-05-27','2021-11-22','Sales','Business Development Manager','Rahul Verma','50100123456707','ABCPS1207F','100200300407'),
 ('PS008','Divya','Kulkarni','divya.kulkarni@progmentsolution.com','9876543208','1996-08-15','2023-07-03','Design','Product Designer','Sneha Iyer','50100123456708','ABCPS1208F','100200300408'),
 ('PS009','Rohit','Gupta','rohit.gupta@progmentsolution.com','9876543209','1990-12-02','2019-09-16','Engineering','DevOps Engineer','Priya Nair','50100123456709','ABCPS1209F','100200300409'),
 ('PS010','Meera','Joshi','meera.joshi@progmentsolution.com','9876543210','1997-03-21','2024-02-19','Operations','Operations Analyst','Rahul Verma','50100123456710','ABCPS1210F','100200300410')
) AS v(code,fn,ln,email,phone,dob,doj,dept,desig,mgr,acct,pan,uan)
JOIN public.departments d ON d.name = v.dept;

INSERT INTO public.salary_structures (employee_id, basic_salary, hra, special_allowance, conveyance_allowance, medical_allowance, other_allowances, pf, professional_tax, tds, other_deductions, annual_ctc, variable_pay, effective_from)
SELECT e.id,
  b.basic, round(b.basic*0.4,2), round(b.basic*0.25,2), 1600, 1250, 1000,
  round(b.basic*0.12,2), 200, round(b.basic*0.08,2), 0,
  round((b.basic + b.basic*0.4 + b.basic*0.25 + 3850)*12,2), round(b.basic*0.1,2), '2025-04-01'
FROM public.employees e
JOIN (VALUES
 ('PS001',60000),('PS002',85000),('PS003',110000),('PS004',48000),('PS005',55000),
 ('PS006',38000),('PS007',52000),('PS008',42000),('PS009',58000),('PS010',35000)
) AS b(code,basic) ON b.code = e.employee_code;

-- 3 months of processed payroll + payslips
WITH periods AS (
  SELECT * FROM (VALUES (2026,5),(2026,6),(2026,7)) AS p(yr, mo)
), calc AS (
  SELECT e.id AS emp_id, p.yr AS yr, p.mo AS mo,
    (s.basic_salary+s.hra+s.special_allowance+s.conveyance_allowance+s.medical_allowance+s.other_allowances) AS gross,
    (s.pf+s.professional_tax+s.tds+s.other_deductions) AS ded
  FROM public.employees e
  JOIN public.salary_structures s ON s.employee_id = e.id
  CROSS JOIN periods p
)
INSERT INTO public.payrolls (employee_id, payroll_month, payroll_year, gross_salary, total_deductions, net_salary, status, locked, processed_at)
SELECT emp_id, mo, yr, gross, ded, gross-ded, 'approved', true, make_timestamptz(yr, mo, 28, 12, 0, 0)
FROM calc;

INSERT INTO public.payroll_items (payroll_id, component_name, component_type, amount)
SELECT pr.id, x.name, x.ctype, x.amt
FROM public.payrolls pr
JOIN public.salary_structures s ON s.employee_id = pr.employee_id
CROSS JOIN LATERAL (VALUES
 ('Basic Salary','earning',s.basic_salary),
 ('House Rent Allowance','earning',s.hra),
 ('Special Allowance','earning',s.special_allowance),
 ('Conveyance Allowance','earning',s.conveyance_allowance),
 ('Medical Allowance','earning',s.medical_allowance),
 ('Other Allowances','earning',s.other_allowances),
 ('Provident Fund','deduction',s.pf),
 ('Professional Tax','deduction',s.professional_tax),
 ('Income Tax (TDS)','deduction',s.tds)
) AS x(name,ctype,amt);

INSERT INTO public.payslips (payroll_id, employee_id, payslip_number, generated_at)
SELECT pr.id, pr.employee_id,
  'PS-' || pr.payroll_year || lpad(pr.payroll_month::text,2,'0') || '-' || e.employee_code,
  pr.processed_at
FROM public.payrolls pr JOIN public.employees e ON e.id = pr.employee_id;

INSERT INTO public.announcements (title, content) VALUES
 ('Independence Day Holiday','The office will remain closed on 15 August. Wishing everyone a happy Independence Day.'),
 ('Payroll cycle update','Salaries for each month are now credited on the last working day. Payslips are available in the Resources portal.'),
 ('New health insurance policy','Our group health cover has been upgraded. Details are available under Company Policies.');

INSERT INTO public.documents (title, document_type, file_path, is_company_wide) VALUES
 ('Employee Handbook','policy','/documents/employee-handbook.pdf', true),
 ('Leave Policy','policy','/documents/leave-policy.pdf', true),
 ('Code of Conduct','policy','/documents/code-of-conduct.pdf', true),
 ('IT & Security Policy','policy','/documents/it-security-policy.pdf', true);
