import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { nav, site } from "@/lib/site";
import {
  Brain,
  Boxes,
  Cpu,
  Code2,
  Lightbulb,
  GraduationCap,
  Landmark,
  HeartPulse,
  ShieldCheck,
  Truck,
  Factory,
  Smartphone,
  Plane,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Progment Solution — Custom Software, AI, Blockchain & IoT" },
      { name: "description", content: "We design, build and operate modern software products. AI, blockchain, IoT and full-stack engineering for ambitious teams." },
      { property: "og:title", content: "Progment Solution" },
      { property: "og:description", content: "Custom software, AI, blockchain and IoT solutions." },
    ],
  }),
  component: Home,
});

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/services/ai": Brain,
  "/services/blockchain": Boxes,
  "/services/iot": Cpu,
  "/services/consulting": Lightbulb,
  "/services/development": Code2,
};

const industryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/industries/edtech": GraduationCap,
  "/industries/fintech": Landmark,
  "/industries/healthcare": HeartPulse,
  "/industries/insurance": ShieldCheck,
  "/industries/logistics": Truck,
  "/industries/manufacturing": Factory,
  "/industries/on-demand": Smartphone,
  "/industries/travel": Plane,
};

function Home() {
  const slides = [
    { title: "Artificial Intelligence", caption: "Predicting the future isn't magic — it's artificial intelligence.", Icon: Brain },
    { title: "Blockchain", caption: "The biggest opportunity set we can think of over the next decade.", Icon: Boxes },
    { title: "Internet of Things", caption: "A game-changer for end-to-end business transformation.", Icon: Cpu },
    { title: "Software Development", caption: "Engineering crafted by people, built to last.", Icon: Code2 },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);
  const go = (d: number) => setActive((i) => (i + d + slides.length) % slides.length);

  return (
    <SiteLayout>
      {/* Hero slider */}
      <section className="relative text-white overflow-hidden" style={{ background: "var(--gradient-hero)", minHeight: "640px" }}>
        {/* dotted backdrop */}
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative container mx-auto px-4 py-28 lg:py-36 min-h-[640px] flex items-center justify-center text-center">
          {slides.map((s, i) => {
            const Icon = s.Icon;
            return (
              <div
                key={s.title}
                className={`absolute inset-0 flex flex-col items-center justify-center px-6 transition-all duration-700 ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
              >
                <Icon className="h-24 w-24 mb-8 opacity-80" strokeWidth={1} />
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight uppercase">{s.title}</h1>
                <p className="mt-6 max-w-2xl text-base md:text-lg opacity-90 italic">"{s.caption}"</p>
              </div>
            );
          })}
        </div>
        <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 h-14 w-14 grid place-items-center text-white hover:opacity-90" style={{ background: "var(--brand-green)" }}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button aria-label="Next" onClick={() => go(1)} className="absolute right-0 top-1/2 -translate-y-1/2 h-14 w-14 grid place-items-center text-white hover:opacity-90" style={{ background: "var(--brand-green)" }}>
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all ${i === active ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
          ))}
        </div>
      </section>

      {/* About strip */}
      <section className="container mx-auto px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-primary font-semibold uppercase text-xs tracking-widest">Who we are</p>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">A focused team of engineers, designers and product thinkers</h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            We combine deep technical expertise with a hands-on, collaborative approach. Every engagement starts with understanding your goals — then we build software that fits, scales and lasts.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "End-to-end delivery: discovery, design, build, launch and support",
              "Senior-led teams with real industry experience",
              "Cloud-native architectures designed for scale and reliability",
              "Transparent communication and predictable timelines",
            ].map((t) => (
              <li key={t} className="flex gap-2 text-sm"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { n: "50+", l: "Projects delivered" },
            { n: "12+", l: "Industries served" },
            { n: "98%", l: "Client retention" },
            { n: "24/7", l: "Support coverage" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border bg-card p-6 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="text-3xl font-bold text-primary">{s.n}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-primary font-semibold uppercase text-xs tracking-widest">What we do</p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Services built around your roadmap</h2>
            <p className="text-muted-foreground mt-3">From early prototypes to enterprise platforms, we cover the full software lifecycle.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {nav.services.map((s) => {
              const Icon = serviceIcons[s.to] ?? Code2;
              return (
                <Link key={s.to} to={s.to} className="group rounded-2xl bg-card border p-6 hover:border-primary transition" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="h-12 w-12 rounded-lg grid place-items-center text-white mb-4" style={{ background: "var(--gradient-bar)" }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">{s.label}</h3>
                  <p className="text-sm text-muted-foreground mt-2">Strategy, design and engineering tailored to your business outcomes.</p>
                  <span className="inline-flex items-center gap-1 mt-4 text-sm text-primary font-medium group-hover:gap-2 transition-all">Learn more <ArrowRight className="h-4 w-4" /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-primary font-semibold uppercase text-xs tracking-widest">Our Products</p>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">Ready-to-deploy platforms</h2>
          <p className="text-muted-foreground mt-3">Battle-tested products you can roll out quickly and tailor to your needs.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {nav.products.map((p) => (
            <Link key={p.to} to={p.to} className="group rounded-2xl border bg-card p-6 hover:border-primary transition" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="font-semibold">{p.label}</h3>
              <p className="text-sm text-muted-foreground mt-2">Modern, modular and ready for production deployments.</p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm text-primary font-medium group-hover:gap-2 transition-all">Explore <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Industries */}
      <section className="bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-primary font-semibold uppercase text-xs tracking-widest">Industries</p>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Deep expertise across sectors</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {nav.industries.map((i) => {
              const Icon = industryIcons[i.to] ?? Boxes;
              return (
                <Link key={i.to} to={i.to} className="rounded-xl bg-card border p-5 flex flex-col items-center text-center gap-2 hover:border-primary transition">
                  <Icon className="h-7 w-7 text-primary" />
                  <span className="text-sm font-medium">{i.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-white" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4 py-16 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Have an idea? Let's build it together.</h2>
            <p className="opacity-90 mt-2">Reach our team and get a tailored proposal within 48 hours.</p>
          </div>
          <Link to="/contact" className="px-6 py-3 rounded-md bg-white text-foreground font-semibold w-fit">Get in Touch</Link>
        </div>
      </section>
    </SiteLayout>
  );
}