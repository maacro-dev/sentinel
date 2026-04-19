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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (!userError && user) {
        userId = user.id;
      }
    }

    console.log("user id", userId)

    const backupData: Record<string, any[]> = {};

    const { data: users, error: usersError } = await supabaseAdmin
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
      'notifications',
      "system_audit_logs",
      "activity_logs",
      // "audit_errors",
      "predicted_yields",
    ];

    for (const table of tables) {
      console.log(`Fetching ${table}...`);
      let allRows: any[] = [];
      let page = 0;
      const pageSize = 1000;

      while (true) {
        const { data, error } = await supabaseAdmin
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

    const logEntry = {
      occurred_at: new Date().toISOString(),
      user_id: userId,
      event_type: 'backup_downloaded',
      table_name: null,
      record_id: null,
      action: 'backup',
      details: {
        tables_included: Object.keys(backupData),
        total_rows: Object.values(backupData).reduce((sum, arr) => sum + arr.length, 0),
        timestamp: new Date().toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
      }
    };

    try {
      const { error } = await supabaseAdmin.from("system_audit_logs").insert(logEntry);
      if (error) console.warn("Failed to log backup download:", error.message);
    } catch (err) {
      console.warn("Log insertion error:", err);
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
