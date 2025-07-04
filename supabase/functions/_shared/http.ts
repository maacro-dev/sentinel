const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

export function response(
  body:   object,
  status = 200,
  extra  = { "Content-Type": "application/json" }
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, ...extra },
  });
}

export function preflight() {
  return new Response("ok", { headers: corsHeaders })
}