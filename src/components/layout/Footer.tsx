import { MailLink } from "@/components/MailLink";
import { Link } from "@tanstack/react-router";
import { ChevronUp } from "lucide-react";
import { site, offices } from "@/lib/site";
import footerLogo from "@/assets/footer-logo.jpg.asset.json";

export function Footer() {
  const tags = [
    { label: "Artificial Intelligence", to: "/services/ai" },
    { label: "Blockchain", to: "/services/blockchain" },
    { label: "IoT", to: "/services/iot" },
    { label: "Software Consulting", to: "/services/consulting" },
    { label: "Software Development", to: "/services/development" },
    { label: "App Development", to: "/industries/on-demand" },
    { label: "Web Development", to: "/services/development" },
  ];
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Products", to: "/products/sms" },
    { label: "Services", to: "/services/ai" },
    { label: "Industries", to: "/industries/edtech" },
    { label: "Our Work", to: "/our-work/consultation" },
    { label: "Contact", to: "/contact" },
  ];
  return (
    <footer className="relative text-white mt-0" style={{ background: "oklch(0.32 0.06 220)" }}>
      <div className="container mx-auto px-4 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <Link to="/" className="inline-flex items-center bg-white rounded-md p-3">
            <img src={footerLogo.url} alt={`${site.name} logo`} className="h-12 w-auto object-contain" />
          </Link>
          <div className="h-px bg-white/15 my-6" />
          <p className="text-sm leading-relaxed opacity-85">
            {site.name} partners with organisations to design, build and operate modern software — from custom products to AI, blockchain and IoT.
          </p>
          <div className="mt-4 space-y-3">
            {offices.map((o) => (
              <div key={o.country} className="text-sm opacity-85">
                <p className="font-semibold uppercase tracking-wide text-[11px]" style={{ color: "oklch(0.78 0.16 145)" }}>{o.label}</p>
                <p className="leading-relaxed">{o.address}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-center text-lg font-semibold tracking-wider uppercase">Quick Links</h4>
          <div className="mx-auto mt-2 h-0.5 w-12" style={{ background: "var(--brand-green)" }} />
          <ul className="mt-6 space-y-3 text-sm">
            {quickLinks.map((l) => (
              <li key={l.to} className="border-b border-white/10 pb-2">
                <Link to={l.to} className="opacity-85 hover:opacity-100 hover:text-[oklch(0.78_0.16_145)] transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-center text-lg font-semibold tracking-wider uppercase">Tags</h4>
          <div className="mx-auto mt-2 h-0.5 w-12" style={{ background: "var(--brand-green)" }} />
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link
                key={t.label}
                to={t.to}
                className="px-3 py-1.5 text-xs uppercase tracking-wide border border-white/25 rounded-sm hover:border-white hover:bg-white/10 transition"
              >
                {t.label}
              </Link>
            ))}
          </div>
          <div className="mt-8 text-sm opacity-85 space-y-1">
            <div><a href={`tel:${site.phone}`} className="hover:text-[oklch(0.78_0.16_145)]"><span className="font-semibold">IND:</span> {site.phoneDisplay}</a></div>
            <div><a href={`tel:${site.phone2}`} className="hover:text-[oklch(0.78_0.16_145)]"><span className="font-semibold">PHL:</span> {site.phone2Display}</a></div>
            <div><a href={`tel:${site.phone3}`} className="hover:text-[oklch(0.78_0.16_145)]"><span className="font-semibold">USA:</span> {site.phone3Display}</a></div>
            <div><MailLink className="hover:text-[oklch(0.78_0.16_145)] break-all" /></div>
          </div>

        </div>
      </div>

      <div className="border-t border-white/10" style={{ background: "oklch(0.22 0.05 220)" }}>
        <div className="container mx-auto px-4 py-4 text-xs opacity-80 text-center relative">
          Copyright © {new Date().getFullYear()} {site.name}. All rights reserved.
          <button
            aria-label="Back to top"
            onClick={() => typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" })}
            className="absolute right-4 -top-6 h-10 w-10 grid place-items-center text-white shadow-lg hover:opacity-90"
            style={{ background: "var(--brand-green)" }}
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
