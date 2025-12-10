import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type InvitePayload = {
  to: string;
  subject: string;
  html: string;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "no-reply@localhost";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const payload = (await req.json()) as InvitePayload;
    if (!payload?.to || !payload?.subject || !payload?.html) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500 });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    const result = await emailRes.json().catch(() => ({}));
    if (!emailRes.ok) {
      return new Response(JSON.stringify({ error: result?.message || "Failed to send email" }), { status: 502 });
    }

    return new Response(JSON.stringify({ success: true, result }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
});

