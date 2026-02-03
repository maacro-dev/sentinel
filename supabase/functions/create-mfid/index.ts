
import { getClient } from "@clients"
import { preflight, response } from "@http"

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

