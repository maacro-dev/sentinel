import { createClient } from "jsr:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const responseHeaders = { "Content-Type": "application/json" };

function response(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, ...responseHeaders },
  });
}

function preflight() {
  return new Response("ok", { headers: corsHeaders });
}


const DOMAIN = "sentinel-9cf.pages.dev"

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return preflight();

    const { email, redirect_to } = await req.json();

    if (!email) {
      return response({ error: "email is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const redirectTo = redirect_to || `${Deno.env.get("SITE_URL")}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // redirectTo,
      redirectTo: `${DOMAIN}/reset-password`
    });

    if (error) {
      return response({ error: error.message }, 400);
    }

    return response({ success: true, message: "Password reset email sent." }, 200);
  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
});
