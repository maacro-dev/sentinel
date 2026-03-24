
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const responseHeaders = {
  "Content-Type": "application/json",
};

function response(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, ...responseHeaders },
  });
}

function preflight() {
  return new Response("ok", { headers: corsHeaders });
}

const base = Deno.env.get("ORACLE_URL") ?? "http://172.30.190.98:8000";
const ORACLE_URL = `${base}/predict`;

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return preflight();
    }

    const body = await req.json();
    const { seasonId } = body;

    const pythonResult = await fetch(ORACLE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({
        season_id: seasonId,
      }),
    });

    if (!pythonResult.ok) {
      const text = await pythonResult.text();
      console.error("FastAPI error:", text);
      return response({ error: `FastAPI error: ${pythonResult.status} ${text}` }, 500);
    }

    const data = await pythonResult.json();
    return response(data, 200);
  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
});
