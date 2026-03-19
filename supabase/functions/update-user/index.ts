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

    const { user_id, first_name, last_name, email, role, password } = await req.json();

    if (!user_id) {
      return response({ error: "user_id is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Build auth updates
    const authUpdates: any = {};
    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;

    // Build user_metadata (correct field name)
    const user_metadata: any = {};
    if (first_name) user_metadata.first_name = first_name;
    if (last_name) user_metadata.last_name = last_name;
    if (role) user_metadata.role = role;
    if (Object.keys(user_metadata).length > 0) {
      authUpdates.user_metadata = user_metadata;
    }

    if (Object.keys(authUpdates).length === 0) {
      return response({ error: "No updates provided" }, 400);
    }

    const { data: updateData, error: authError } = await supabase.auth.admin.updateUserById(
      user_id,
      authUpdates
    );

    if (authError) {
      return response({ error: authError.message }, 400);
    }

    const { data: user, error: fetchError } = await supabase
      .from('user_details')
      .select('*')
      .eq('id', user_id)
      .single();

    if (fetchError) {
      return response({ success: true, warning: "Update succeeded but fetch failed" }, 200);
    }

    return response({ success: true, user }, 200);
  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
});
