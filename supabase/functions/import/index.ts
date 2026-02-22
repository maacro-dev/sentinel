import { getClientWithAuthorization } from "@clients"
import { preflight, response } from "@http"

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return preflight();
    }
    const { supabase, token } = getClientWithAuthorization(req);

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    const { form, data } = await req.json();

    if (!user || userError) {
      return response({ success: false, message: `error = ${userError}` }, 500);
    }

    return response({ success: true, message: `got form=${form} and data=${data}` }, 200);

  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
})
