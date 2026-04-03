import { createClient } from "jsr:@supabase/supabase-js";
import { gzip } from "jsr:@deno-library/compress";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const backupData: Record<string, any[]> = {};

    const { data: users, error: usersError } = await supabase
      .from("user_backup_view")
      .select("*");
    if (usersError) throw new Error(`Error fetching users: ${usersError.message}`);
    backupData.users = users;

    const tables = [
      "mfids",
      "farmers",
      "fields",
      "seasons",
      "collection_tasks",
      "monitoring_visits",
      "field_activities",
      "field_plannings",
      "crop_establishments",
      "fertilization_records",
      "fertilizer_applications",
      "harvest_records",
      "damage_assessments",
      "system_audit_logs",
      "activity_logs",
      "audit_errors",
      "predicted_yields",
    ];

    for (const table of tables) {
      console.log(`Fetching ${table}...`);
      let allRows: any[] = [];
      let page = 0;
      const pageSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .range(page * pageSize, (page + 1) * pageSize - 1);
        if (error) throw new Error(`Error fetching ${table}: ${error.message}`);
        if (!data || data.length === 0) break;

        allRows = allRows.concat(data);
        page++;
      }
      backupData[table] = allRows;
    }

    const jsonString = JSON.stringify(backupData);
    const compressed = await gzip(new TextEncoder().encode(jsonString));

    return new Response(compressed, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="backup_${new Date().toISOString()}.bak"`,
      },
    });
  } catch (err) {
    console.error("Backup error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
