import { getClientWithAuthorization } from "@clients"
import { preflight, response } from "@http"

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return preflight();
    }
    const { supabase, token } = getClientWithAuthorization(req);

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    const { form, data, fileName } = await req.json();

    if (!user || userError) {
      return response({ success: false, message: `error = ${userError}` }, 500);
    }

    if (form === 'field_plannings' || form === 'harvest_records') {
      const { data: result, error } = await supabase.rpc('import_data_transaction', {
        p_dataset_type: form,
        p_data: data,
      });

      if (error || data.errors) {
        console.log(error)
        return response({ success: false, message: `Error importing ${form} - ${error.message}` }, 400);
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
