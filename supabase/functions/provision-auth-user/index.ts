import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ProvisionPayload = {
  email: string;
  role?: string;
  metadata?: Record<string, unknown>;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const payload = (await req.json()) as ProvisionPayload;
    const email = payload?.email?.trim();
    if (!email) return new Response(JSON.stringify({ error: "E-mail inválido" }), { status: 400 });

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase service configuration" }), { status: 500 });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: existing } = await admin.auth.admin.getUserByEmail(email);
    if (existing?.user) {
      return new Response(JSON.stringify({ ok: true, message: "User already exists" }), { status: 200 });
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      user_metadata: payload?.metadata || {},
      email_confirm: false,
    });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, user: data?.user }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500 });
  }
});

