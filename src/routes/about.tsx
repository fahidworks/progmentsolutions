import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Progment Solution" },
      { name: "description", content: "Learn about Progment Solution: our mission, values, and the team building modern software for ambitious organisations." },
      { property: "og:title", content: "About Progment Solution" },
      { property: "og:description", content: "Our mission, values and approach." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero title="About Us" subtitle="A focused software company helping businesses ship better products, faster." />
      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="text-3xl font-bold">Our story</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Progment Solution was founded with a simple belief: great software is the result of great engineering paired with deep understanding of the business it serves. We work shoulder-to-shoulder with founders, product leaders and enterprise teams to turn complex problems into clean, reliable, scalable solutions.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            From a tight-knit team of engineers and designers, we have grown into a multi-disciplinary group covering product strategy, custom development, AI, blockchain, IoT, mobile, cloud and ongoing support — all delivered under one roof from our Bangalore office.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-8 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-semibold text-xl">What we value</h3>
          {[
            "Outcomes over output — we measure success by your business impact",
            "Senior, accountable teams from day one",
            "Honest communication and realistic timelines",
            "Long-term partnerships, not one-off projects",
          ].map((v) => (
            <div key={v} className="flex gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span>{v}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          {[
            { h: "Mission", b: "Help organisations build software that creates real, measurable value — efficiently and reliably." },
            { h: "Vision", b: "Be the partner clients trust to deliver their most important digital products, at any scale." },
            { h: "Approach", b: "Discover, design, build, ship and improve — iteratively, with you in the loop at every step." },
          ].map((c) => (
            <div key={c.h} className="bg-card rounded-2xl border p-8">
              <h3 className="font-semibold text-xl text-primary">{c.h}</h3>
              <p className="text-sm text-muted-foreground mt-3">{c.b}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Ready to work together?</h2>
        <Link to="/contact" className="inline-block mt-4 px-6 py-3 rounded-md text-white font-semibold" style={{ background: "var(--gradient-bar)" }}>Contact Us</Link>
      </section>
    </SiteLayout>
  );
}