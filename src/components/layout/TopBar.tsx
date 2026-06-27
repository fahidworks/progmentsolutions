import { Phone, Mail, Facebook, Twitter, Linkedin } from "lucide-react";
import { site } from "@/lib/site";

export function TopBar() {
  return (
    <div
      className="w-full text-white text-sm"
      style={{ background: "var(--gradient-bar)" }}
    >
      <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-5">
          <a href={`tel:${site.phone}`} className="flex items-center gap-2 hover:opacity-80">
            <Phone className="h-4 w-4" /> {site.phoneDisplay}
          </a>
          <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:opacity-80">
            <Mail className="h-4 w-4" /> {site.email}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a aria-label="Facebook" href="#" className="hover:opacity-80"><Facebook className="h-4 w-4" /></a>
          <a aria-label="Twitter" href="#" className="hover:opacity-80"><Twitter className="h-4 w-4" /></a>
          <a aria-label="LinkedIn" href="#" className="hover:opacity-80"><Linkedin className="h-4 w-4" /></a>
        </div>
      </div>
    </div>
  );
}