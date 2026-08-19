import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { site } from "@/lib/site";
import aboutPerson from "@/assets/about-woman.png.asset.json";
import {
  Brain,
  Boxes,
  Cpu,
  Code2,
  ArrowRight,
  ArrowLeft,
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

function Home() {
  return <HomeContent />;
}

function ValueBlock({ title, body, children, rows }: { title: string; body?: string; children?: React.ReactNode; rows?: boolean }) {
  return (
    <div className={rows ? "md:row-span-2" : ""}>
      <h3 className="text-2xl font-bold" style={{ color: "var(--brand-green)" }}>{title}</h3>
      <p className="mt-3 text-muted-foreground leading-relaxed">{body ?? children}</p>
    </div>
  );
}

function HomeContent() {
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

      {/* About */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="uppercase text-xs tracking-[0.25em] text-muted-foreground font-semibold">about {site.name.toLowerCase()}</h2>
            <h3 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">
              <span style={{ color: "var(--brand-green)" }}>Software Technologies</span> built for ambitious teams
            </h3>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {site.name} brings together senior engineers, designers and product strategists who have shipped software across industries. We work as an extension of your team — focused, accountable and committed to outcomes that move the business.
              </p>
              <p>
                We don't think of ourselves as just programmers or designers. We're creative technologists. Whether you're a startup finding product-market fit or an enterprise modernising a critical system, our job is to make the technology disappear so your customers can simply feel the value.
              </p>
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-md text-white font-semibold transition hover:opacity-90" style={{ background: "var(--gradient-bar)" }}>
              Read More <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative flex justify-center">
            {/* organic green blob backdrop */}
            <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full" aria-hidden>
              <defs>
                <linearGradient id="blob" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.92 0.10 145)" />
                  <stop offset="100%" stopColor="oklch(0.78 0.16 145)" />
                </linearGradient>
              </defs>
              <path fill="url(#blob)" d="M421,309Q401,368,346,400Q291,432,231,418Q171,404,116,366Q61,328,68,260Q75,192,113,141Q151,90,217,76Q283,62,338,99Q393,136,418,193Q443,250,421,309Z" />
              <path fill="oklch(0.62 0.18 145 / 0.55)" d="M390,330Q360,400,283,410Q206,420,150,365Q94,310,110,235Q126,160,195,118Q264,76,326,121Q388,166,408,228Q428,290,390,330Z" />
            </svg>
            <img src={aboutPerson.url} alt="Progment Solution team" loading="lazy" className="relative w-full max-w-md object-contain" />
          </div>
        </div>
      </section>

      {/* Diagonal CTA band */}
      <section className="relative overflow-hidden text-white">
        <div className="grid md:grid-cols-2 min-h-[260px]">
          <div className="relative p-10 md:p-16 flex flex-col justify-center" style={{ background: "oklch(0.32 0.06 220)" }}>
            <p className="uppercase tracking-[0.3em] text-xs md:text-sm font-semibold opacity-90">Get in touch with us</p>
            <h3 className="text-3xl md:text-4xl font-extrabold mt-3 uppercase tracking-wide">For a Enquiry</h3>
            {/* diagonal cutout */}
            <div className="hidden md:block absolute top-0 right-0 h-full w-32" style={{ background: "oklch(0.32 0.06 220)", clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
            <div className="hidden md:block absolute top-0 right-[-2px] h-full w-32 bg-white" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }} />
          </div>
          <div className="relative p-10 md:p-16 flex flex-col justify-center" style={{ background: "var(--brand-green)" }}>
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide">We are ready to receive your call</h3>
            <a href={`tel:${site.phone}`} className="mt-3 text-2xl md:text-4xl font-extrabold tracking-[0.1em] hover:opacity-90">
              {site.phoneDisplay}
            </a>
            <a href={`tel:${site.phone2}`} className="mt-2 text-2xl md:text-4xl font-extrabold tracking-[0.1em] hover:opacity-90">
              {site.phone2Display}
            </a>
          </div>
        </div>
      </section>

      {/* Vision / Mission / Flexibility */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-x-16 gap-y-10">
          <ValueBlock title="Vision" body="To be the partner clients trust to turn complex business challenges into reliable, beautifully engineered software." />
          <ValueBlock title="Flexibility" rows>
            We adapt to how you work. Sprint with us, augment your team, or hand us a full delivery — every engagement is shaped around your goals and timeline. We listen first, propose options, and only build what genuinely earns its place.
          </ValueBlock>
          <ValueBlock title="Mission" body="To craft software that's measurably better — faster to ship, simpler to operate, and durable enough to grow with your business for years." />
          <ValueBlock title="Quality" body="Senior-led teams, modern architecture, thorough testing and clean code. The little things compound, so we sweat them on every project." />
        </div>
      </section>
    </SiteLayout>
  );
}