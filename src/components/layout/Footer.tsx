import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";
import { nav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="text-white mt-20" style={{ background: "var(--brand-deep)" }}>
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: "var(--gradient-bar)" }}>PS</div>
            <div>
              <div className="font-bold">{site.name}</div>
              <div className="text-[11px] opacity-70">{site.tagline}</div>
            </div>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            We help organisations design, build and operate modern software — from custom products to AI, blockchain and IoT solutions.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Facebook" className="h-9 w-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter" className="h-9 w-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="h-9 w-9 rounded-full bg-white/10 grid place-items-center hover:bg-white/20"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Services</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {nav.services.map((i) => (
              <li key={i.to}><Link to={i.to} className="hover:text-white">{i.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Products</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {nav.products.map((i) => (
              <li key={i.to}><Link to={i.to} className="hover:text-white">{i.label}</Link></li>
            ))}
          </ul>
          <h4 className="font-semibold mt-6 mb-3">Company</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Reach Us</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" /> <span>{site.address}</span></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5" /> <a href={`tel:${site.phone}`} className="hover:text-white">{site.phoneDisplay}</a></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5" /> <a href={`mailto:${site.email}`} className="hover:text-white break-all">{site.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-xs opacity-70 text-center">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}