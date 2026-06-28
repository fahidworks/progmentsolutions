import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { nav, site } from "@/lib/site";

type Group = { label: string; items: { label: string; to: string }[] };

const groups: Group[] = [
  { label: "Products", items: nav.products },
  { label: "Services", items: nav.services },
  { label: "Industries", items: nav.industries },
  { label: "Our Work", items: nav.ourWork },
];

export function Header() {
  const [openMobile, setOpenMobile] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-md grid place-items-center" style={{ background: "var(--gradient-bar)" }}>
            <span className="text-white font-black text-lg">PS</span>
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-2xl tracking-tight">
              <span style={{ color: "var(--brand-green)" }}>PROG</span>
              <span className="text-foreground">MENT</span>
              <span style={{ color: "var(--brand-green)" }}> SOLUTION</span>
            </div>
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground">{site.tagline}</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <Link to="/" className="nav-link px-3 py-2 text-sm font-semibold uppercase tracking-wide">Home</Link>
          <Link to="/about" className="nav-link px-3 py-2 text-sm font-semibold uppercase tracking-wide">About</Link>
          {groups.map((g) => (
            <div key={g.label} className="relative group">
              <button className="nav-link px-3 py-2 text-sm font-semibold uppercase tracking-wide inline-flex items-center gap-1">
                {g.label} <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute left-0 top-full pt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition">
                <div className="min-w-[260px] bg-popover border rounded-md shadow-lg py-2">
                  {g.items.map((i) => (
                    <Link
                      key={i.to}
                      to={i.to}
                      className="block px-4 py-2 text-sm hover:bg-secondary hover:text-primary"
                    >
                      {i.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <Link
            to="/contact"
            className="ml-2 px-4 py-2 rounded-md text-sm font-semibold text-white"
            style={{ background: "var(--gradient-bar)" }}
          >
            Contact Us
          </Link>
        </nav>

        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2"
          onClick={() => setOpenMobile((v) => !v)}
        >
          {openMobile ? <X /> : <Menu />}
        </button>
      </div>

      {openMobile && (
        <div className="lg:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-3 flex flex-col">
            <Link to="/" onClick={() => setOpenMobile(false)} className="py-2 font-medium">Home</Link>
            <Link to="/about" onClick={() => setOpenMobile(false)} className="py-2 font-medium">About</Link>
            {groups.map((g) => (
              <div key={g.label} className="border-t py-1">
                <button
                  onClick={() => setOpenMobileGroup(openMobileGroup === g.label ? null : g.label)}
                  className="w-full text-left py-2 font-medium flex items-center justify-between"
                >
                  {g.label} <ChevronDown className={`h-4 w-4 transition ${openMobileGroup === g.label ? "rotate-180" : ""}`} />
                </button>
                {openMobileGroup === g.label && (
                  <div className="pl-3 pb-2">
                    {g.items.map((i) => (
                      <Link
                        key={i.to}
                        to={i.to}
                        onClick={() => setOpenMobile(false)}
                        className="block py-1.5 text-sm text-muted-foreground hover:text-primary"
                      >
                        {i.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpenMobile(false)}
              className="mt-3 px-4 py-2 rounded-md text-sm font-semibold text-white text-center"
              style={{ background: "var(--gradient-bar)" }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}