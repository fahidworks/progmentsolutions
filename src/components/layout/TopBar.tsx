import { MailLink } from "@/components/MailLink";
import { Link } from "@tanstack/react-router";
import { Phone, Mail, Facebook, Twitter, Linkedin, Instagram, LogIn } from "lucide-react";
import { site } from "@/lib/site";

export function TopBar() {
  return (
    <div
      className="w-full text-white text-sm relative"
      style={{ background: "var(--gradient-bar)" }}
    >
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          {Object.entries(site.headerPhone).map(([key, { label, number, tel }]) => (
            <a key={key} href={`tel:${tel}`} className="flex items-center gap-1.5 hover:opacity-90">
              <Phone className="h-4 w-4" />
              <span className="font-semibold tracking-wide">{label}:</span>
              <span>{number}</span>
            </a>
          ))}
          <MailLink className="flex items-center gap-2 hover:opacity-90">
            <><Mail className="h-4 w-4" /> {site.email}</>
          </MailLink>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="hidden sm:flex items-center gap-1.5 hover:opacity-90">
            <LogIn className="h-4 w-4" /> Sign In
          </Link>
          <div className="flex items-center gap-2">
            <a aria-label="Facebook" href="https://www.facebook.com/profile.php?id=61593732389674" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-[oklch(0.55_0.20_260)] grid place-items-center hover:opacity-90 transition"><Facebook className="h-3.5 w-3.5" fill="currentColor" /></a>
            <a aria-label="Twitter" href="https://x.com/ProgmentSoltn" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-[oklch(0.70_0.16_230)] grid place-items-center hover:opacity-90 transition"><Twitter className="h-3.5 w-3.5" fill="currentColor" /></a>
            <a aria-label="LinkedIn" href="https://www.linkedin.com/in/progment-solution-9b3561430/" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-[oklch(0.50_0.15_245)] grid place-items-center hover:opacity-90 transition"><Linkedin className="h-3.5 w-3.5" fill="currentColor" /></a>
            <a aria-label="Instagram" href="https://www.instagram.com/progment_solution" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-[oklch(0.60_0.18_20)] grid place-items-center hover:opacity-90 transition"><Instagram className="h-3.5 w-3.5" fill="currentColor" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}
