import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = (await req.json()) as ContactPayload;
    if (!data?.name || !data?.email || !data?.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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

    const body = await res.text();
    if (!res.ok) {
      console.error("Resend send failed", res.status, body);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: body }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: true, resend: JSON.parse(body) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-contact-email error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
