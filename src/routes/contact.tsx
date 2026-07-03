import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/lib/site";
import { submitContact } from "@/lib/contact.functions";
import { Phone, Mail, MapPin, Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Progment Solution" },
      { name: "description", content: "Get in touch with Progment Solution. Call, email, or send us a message — we usually reply within one business day." },
      { property: "og:title", content: "Contact Progment Solution" },
      { property: "og:description", content: "Reach our Bangalore team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const fd = new FormData(e.currentTarget);
    try {
      await submitContact({
        data: {
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          subject: String(fd.get("subject") || ""),
          message: String(fd.get("message") || ""),
        },
      });
      setStatus("success");
      toast.success("Message sent! We'll be in touch shortly.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMsg(msg);
      toast.error(msg);
    }
  }

  return (
    <SiteLayout>
      <PageHero title="Contact Us" subtitle="We'd love to hear about your project. Send us a message and we'll get back within one business day." />
      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-3 gap-10">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 flex gap-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="h-12 w-12 rounded-lg grid place-items-center text-white flex-shrink-0" style={{ background: "var(--gradient-bar)" }}><MapPin className="h-5 w-5" /></div>
            <div>
              <h3 className="font-semibold">Office</h3>
              <p className="text-sm text-muted-foreground mt-1">{site.address}</p>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 flex gap-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="h-12 w-12 rounded-lg grid place-items-center text-white flex-shrink-0" style={{ background: "var(--gradient-bar)" }}><Phone className="h-5 w-5" /></div>
            <div>
              <h3 className="font-semibold">Phone</h3>
              <a href={`tel:${site.phone}`} className="text-sm text-muted-foreground hover:text-primary">{site.phoneDisplay}</a>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 flex gap-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="h-12 w-12 rounded-lg grid place-items-center text-white flex-shrink-0" style={{ background: "var(--gradient-bar)" }}><Mail className="h-5 w-5" /></div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <a href={`mailto:${site.email}`} className="text-sm text-muted-foreground hover:text-primary break-all">{site.email}</a>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 md:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          {status === "success" ? (
            <div className="flex flex-col items-center text-center py-10">
              <CheckCircle2 className="h-14 w-14 text-primary" />
              <h3 className="text-2xl font-bold mt-4">Thank you!</h3>
              <p className="text-muted-foreground mt-2 max-w-md">Your message has been received. Our team will get back to you shortly at the email you provided.</p>
              <button onClick={() => setStatus("idle")} className="mt-6 px-5 py-2 rounded-md text-white font-medium" style={{ background: "var(--gradient-bar)" }}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4">
              <h2 className="text-2xl font-bold">Send us a message</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field name="name" label="Your Name" required />
                <Field name="email" label="Email Address" type="email" required />
                <Field name="phone" label="Phone" />
                <Field name="subject" label="Subject" />
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-medium">Message *</label>
                <textarea id="message" name="message" required rows={6} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              {status === "error" && <p className="text-sm text-destructive">{errorMsg}</p>}
              <button type="submit" disabled={status === "loading"} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-white font-semibold disabled:opacity-60" style={{ background: "var(--gradient-bar)" }}>
                {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>
      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-2xl overflow-hidden border" style={{ boxShadow: "var(--shadow-card)" }}>
          <iframe
            title="Office location map"
            src={site.mapsEmbed}
            className="w-full h-[400px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}{required ? " *" : ""}</label>
      <input id={name} name={name} type={type} required={required} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}