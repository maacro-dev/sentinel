import { createClient } from "jsr:@supabase/supabase-js";

export function getClientWithAuthorization(request) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: request.headers.get('Authorization')! },
      },
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: false
      },
    }
  );

  return {
    supabase,
    token: request.headers.get('Authorization').replace('Bearer ', '')!
  }
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


Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return preflight();
    }
    const { supabase, token } = getClientWithAuthorization(req);

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    const { form, data, fileName } = await req.json();

    console.log('RPC got this data: formType =', form, "fileName =", fileName, "data =", data);

    if (!user || userError) {
      return response({ success: false, message: `error = ${userError}` }, 500);
    }

    if (form === 'field_plannings' || form === 'harvest_records' || form === 'crop_establishments' || form === 'damage_assessments' || form == 'fertilization_records') {
      const { data: result, error } = await supabase.rpc('import_data_transaction', {
        p_dataset_type: form,
        p_data: data,
      });

      console.log('RPC result:', JSON.stringify(result));

      if (error || (data.errors && data.errors.length > 0)) {
        console.log('RPC error or data errors:', error, data.errors);
        return response({ success: false, message: `Error importing ${form}` }, 400);
      }

      console.log(result)

      return response({ success: true, message: `Successfully imported ${result.imported_count} rows from "${fileName}".` }, 200);

    } else {

      return response({ success: false, message: `TODO: form type not supported yet.` }, 400);
    }

  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
})
