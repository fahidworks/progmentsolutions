import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional().default(""),
  subject: z.string().max(200).optional().default(""),
  message: z.string().min(5).max(5000),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) {
      console.error("contact insert error", error);
      throw new Error("Could not save your message. Please try again.");
    }

    // Send notification email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service is not configured. Please contact the site owner.");
    }

    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = `
      <h2>New contact form submission</h2>
      <table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
        <tr><td><strong>Name</strong></td><td>${escape(data.name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escape(data.email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escape(data.phone || "—")}</td></tr>
        <tr><td><strong>Subject</strong></td><td>${escape(data.subject || "—")}</td></tr>
        <tr><td valign="top"><strong>Message</strong></td><td><pre style="white-space:pre-wrap;font-family:inherit;margin:0">${escape(data.message)}</pre></td></tr>
      </table>
    `;
    const text = `New contact form submission

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || "—"}
Subject: ${data.subject || "—"}

Message:
${data.message}
`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "info@progmentsolution.com",
        to: ["info@progmentsolution.com"],
        reply_to: data.email,
        subject: `New contact: ${data.subject || data.name}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend send failed", res.status, body);
      throw new Error("Your message was saved but the email notification failed to send.");
    }

    return { ok: true };
  });
