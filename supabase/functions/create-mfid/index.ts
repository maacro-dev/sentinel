import { createClient } from "jsr:@supabase/supabase-js";


export function getClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SECRET_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: false
      },
    }
  );
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
}

const responseHeaders = {
  "Content-Type": "application/json",
}

export function response(
  body: object,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, ...responseHeaders },
  });
}

export function preflight() {
  return new Response("ok", { headers: corsHeaders })
}


// - get the the initial 6 digits code from the `cities_municipalities` table in the `code` field
// - the last 3 digits are just a counter (000..001..002)

Deno.serve(async (req) => {
  try {

    if (req.method === "OPTIONS") {
      return preflight();
    }

    const body = await req.json();

    const { province, city_municipality } = body;

    const supabase = getClient();

    const { data, error } = await supabase.rpc('generate_mfid', {
      p_municity: city_municipality,
      p_province: province
    })

    if (error) {
      return response({ success: false, message: `${error.message}. Inputs: { province: ${province}, city_municipality: ${city_municipality}}` }, error.status);
    }

    return response({ success: true, message: `${data}` }, 200);

  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
})

