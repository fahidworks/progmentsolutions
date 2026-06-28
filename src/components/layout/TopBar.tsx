import { Phone, Mail, Facebook, Twitter, Linkedin, LogIn } from "lucide-react";
import { site } from "@/lib/site";

export function TopBar() {
  return (
    <div
      className="w-full text-white text-sm relative"
      style={{ background: "var(--gradient-bar)" }}
    >
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-6">
          <a href={`tel:${site.phone}`} className="flex items-center gap-2 hover:opacity-90">
            <Phone className="h-4 w-4" /> {site.phoneDisplay}
          </a>
          <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:opacity-90">
            <Mail className="h-4 w-4" /> {site.email}
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hidden sm:flex items-center gap-1.5 hover:opacity-90">
            <LogIn className="h-4 w-4" /> Sign In
          </a>
          <div className="flex items-center gap-2">
            <a aria-label="Facebook" href="#" className="h-8 w-8 rounded-full bg-[oklch(0.55_0.20_260)] grid place-items-center hover:opacity-90 transition"><Facebook className="h-3.5 w-3.5" fill="currentColor" /></a>
            <a aria-label="Twitter" href="#" className="h-8 w-8 rounded-full bg-[oklch(0.70_0.16_230)] grid place-items-center hover:opacity-90 transition"><Twitter className="h-3.5 w-3.5" fill="currentColor" /></a>
            <a aria-label="LinkedIn" href="#" className="h-8 w-8 rounded-full bg-[oklch(0.50_0.15_245)] grid place-items-center hover:opacity-90 transition"><Linkedin className="h-3.5 w-3.5" fill="currentColor" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}