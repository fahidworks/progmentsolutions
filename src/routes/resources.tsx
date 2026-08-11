import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import {
  LayoutDashboard, Wallet, FileText, CalendarCheck, PlaneTakeoff,
  FolderLock, ScrollText, Megaphone, User, ShieldCheck, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Employee Resources & Payroll Portal — Progment Solution" },
      { name: "description", content: "Secure employee resources at Progment Solution: payroll, payslips, attendance, leave management, documents, policies and announcements." },
      { property: "og:title", content: "Employee Resources & Payroll Portal — Progment Solution" },
      { property: "og:description", content: "Secure internal portal for Progment Solution employees and HR — payroll, payslips, attendance, leave and company documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResourcesPage,
});

const cards = [
  { icon: LayoutDashboard, title: "Employee Portal", desc: "Your personalised home for everything HR." },
  { icon: Wallet, title: "Payroll", desc: "Monthly payroll runs, salary structures and approvals." },
  { icon: FileText, title: "Payslips", desc: "Download professional PDF payslips for every month." },
  { icon: CalendarCheck, title: "Attendance", desc: "Daily attendance, working hours and monthly summaries." },
  { icon: PlaneTakeoff, title: "Leave Management", desc: "Apply for leave, track balances and approvals." },
  { icon: FolderLock, title: "Employee Documents", desc: "Offer letters, appointment letters and HR records." },
  { icon: ScrollText, title: "Company Policies", desc: "Handbook, code of conduct and workplace policies." },
  { icon: Megaphone, title: "Announcements", desc: "Company-wide updates from leadership and HR." },
  { icon: User, title: "Profile", desc: "Keep your contact and work details up to date." },
  { icon: ShieldCheck, title: "Admin Dashboard", desc: "HR controls for employees, payroll and reporting." },
];

function ResourcesPage() {
  return (
    <SiteLayout>
      <PageHero title="Resources" subtitle="Employee & payroll management for the Progment Solution team" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">Everything your workday needs, in one secure place</h2>
            <p className="mt-3 text-muted-foreground">
              The Resources portal is our internal HR and payroll system. Sign in with your work email to access
              payslips, attendance, leave and company documents. All payroll data is protected by role-based access —
              employees only ever see their own records.
            </p>
            <Link
              to="/auth"
              className="mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: "var(--gradient-bar)" }}
            >
              Sign in to the portal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Link key={c.title} to="/auth" className="group rounded-xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-primary/40">
                <span className="mb-4 inline-grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
