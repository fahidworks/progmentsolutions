import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "./PageHero";

export interface InfoPageProps {
  title: string;
  subtitle: string;
  intro: string;
  sections: { heading: string; body: string }[];
  features: string[];
  ctaText?: string;
}

export function InfoPage({ title, subtitle, intro, sections, features, ctaText }: InfoPageProps) {
  return (
    <>
      <PageHero title={title} subtitle={subtitle} />
      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <p className="text-lg text-muted-foreground leading-relaxed">{intro}</p>
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-2xl font-semibold text-foreground mb-3">{s.heading}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <aside className="space-y-6">
          <div className="rounded-xl border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-semibold text-foreground mb-4">What you get</h3>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-6 text-white" style={{ background: "var(--gradient-hero)" }}>
            <h3 className="font-semibold mb-2">{ctaText ?? "Want to discuss your project?"}</h3>
            <p className="text-sm opacity-90 mb-4">Talk to our team for a free consultation tailored to your goals.</p>
            <Link to="/contact" className="inline-block bg-white text-foreground px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90">Contact Us</Link>
          </div>
        </aside>
      </section>
    </>
  );
}