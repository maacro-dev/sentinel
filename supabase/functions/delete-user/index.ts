// supabase/functions/delete-user/index.ts

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

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return preflight();

    const { user_id } = await req.json();
    if (!user_id) return response({ error: "user_id is required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: publicError } = await supabase
      .from('users')
      .delete()
      .eq('id', user_id);
    if (publicError) return response({ error: publicError.message }, 400);

    const { error: authError } = await supabase.auth.admin.deleteUser(user_id);
    if (authError) return response({ error: authError.message }, 400);

    return response({ success: true }, 200);
  } catch (err) {
    console.error(err);
    return response({ error: err.message }, 500);
  }
});
