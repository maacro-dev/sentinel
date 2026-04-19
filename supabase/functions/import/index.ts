import { createClient } from "jsr:@supabase/supabase-js";

export function getClientWithAuthorization(request: Request) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
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
    token: request.headers.get('Authorization')!.replace('Bearer ', '')
  };
}

function getServiceRoleClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const responseHeaders = {
  "Content-Type": "application/json",
};

export function response(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, ...responseHeaders },
  });
}

export function preflight() {
  return new Response("ok", { headers: corsHeaders });
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return preflight();
    }

    const { supabase, token } = getClientWithAuthorization(req);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (!user || userError) {
      return response({ success: false, message: `Authentication error` }, 500);
    }

    const { form, data, fileName } = await req.json();

    const supportedForms = ['field_plannings', 'harvest_records', 'crop_establishments', 'damage_assessments', 'fertilization_records'];
    if (!supportedForms.includes(form)) {
      return response({ success: false, message: `Form type "${form}" not supported.` }, 400);
    }

    const adminClient = getServiceRoleClient();
    const batchId = crypto.randomUUID();

    console.log(`Importing ${form} with ${data.length} rows`);

    try {
      const { data: result, error } = await supabase.rpc('import_data_transaction', {
        p_dataset_type: form,
        p_data: data,
      });

      if (error || (result?.errors && result.errors.length > 0)) {
        throw new Error(error?.message || `Import RPC returned errors: ${JSON.stringify(result.errors)}`);
      }

      await adminClient.from("activity_logs").insert({
        occurred_at: new Date().toISOString(),
        user_id: user.id,
        event_type: "import_completed",
        table_name: form,
        action: "import",
        details: {
          batch_id: batchId,
          file_name: fileName,
          row_count: data.length,
          imported_count: result.imported_count,
          status: "success"
        }
      });

      return response({
        success: true,
        message: `Successfully imported ${result.imported_count} rows from "${fileName}".`
      }, 200);

    } catch (importError) {
      await adminClient.from("activity_logs").insert({
        occurred_at: new Date().toISOString(),
        user_id: user.id,
        event_type: "import_failed",
        table_name: form,
        action: "import",
        details: {
          batch_id: batchId,
          file_name: fileName,
          row_count: data.length,
          error: importError instanceof Error ? importError.message : String(importError),
          status: "failed"
        }
      });

      throw importError;
    }

  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
});
