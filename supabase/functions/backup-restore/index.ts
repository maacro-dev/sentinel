import { createClient } from "jsr:@supabase/supabase-js";
import { gunzip } from "jsr:@deno-library/compress";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function restoreUser(supabase: any, user: any) {
  const { data: existing, error: checkError } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (checkError && !checkError.message.includes("not found")) {
    throw new Error(`Error checking user ${user.id}: ${checkError.message}`);
  }

  if (existing) {
    console.log(`User ${user.id} already exists, skipping creation`);
    return;
  }

  const { error: rpcError } = await supabase.rpc("create_seed_user", {
    p_id: user.id,
    p_email: user.email,
    p_password: user.encrypted_password,
    p_first_name: user.first_name,
    p_last_name: user.last_name,
    p_date_of_birth: user.date_of_birth,
    p_role: user.role,
    p_created_at: user.created_at,
  });

  if (rpcError) {
    throw new Error(`Error creating user ${user.id}: ${rpcError.message}`);
  }
  console.log(`Created user ${user.id} (${user.email})`);
}

const tableOrder = [
  "users",
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

async function resetSequence(supabase: any, table: string) {
  try {
    const { error } = await supabase.rpc('reset_sequence', { table_name: table });
    if (error) {
      console.warn(`Failed to reset sequence for ${table}: ${error.message}`);
    }
  } catch (err) {
    console.warn(`Failed to reset sequence for ${table}:`, err);
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

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

    const formData = await req.formData();
    const file = formData.get("backup") as File | null;
    if (!file) return new Response("Missing backup file", { status: 400, headers: corsHeaders });

    const arrayBuffer = await file.arrayBuffer();
    const decompressed = await gunzip(new Uint8Array(arrayBuffer));
    const jsonString = new TextDecoder().decode(decompressed);
    const backupData = JSON.parse(jsonString);

    const users = backupData.users;
    if (users && users.length > 0) {
      console.log(`Restoring ${users.length} users...`);
      for (const user of users) {
        await restoreUser(supabaseAdmin, user);
      }
    }

    for (let i = tableOrder.length - 1; i >= 0; i--) {
      const table = tableOrder[i];
      if (table === "users") continue;

      console.log(`Deleting from ${table}`);
      const { error: deleteError } = await supabaseAdmin
        .from(table)
        .delete()
        .neq('id', -1);
      if (deleteError) {
        throw new Error(`Error deleting from ${table}: ${deleteError.message}`);
      }

      const { count, error: countError } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (countError) {
        throw new Error(`Error checking count for ${table}: ${countError.message}`);
      }
      if (count > 0) {
        console.warn(`WARNING: Table ${table} still has ${count} rows after deletion.`);
      }
    }

    const restoredTables: string[] = [];
    let totalRowsRestored = 0;

    for (const table of tableOrder) {
      if (table === "users") continue;
      const rows = backupData[table];
      if (!rows || rows.length === 0) continue;

      const uniqueMap = new Map();
      for (const row of rows) {
        if (!uniqueMap.has(row.id)) {
          uniqueMap.set(row.id, row);
        }
      }
      const uniqueRows = Array.from(uniqueMap.values());

      console.log(`Inserting into ${table}: ${uniqueRows.length} rows`);
      const batchSize = 500;
      for (let i = 0; i < uniqueRows.length; i += batchSize) {
        const batch = uniqueRows.slice(i, i + batchSize);
        const { error: upsertError } = await supabaseAdmin
          .from(table)
          .upsert(batch, { onConflict: 'id' });
        if (upsertError) {
          throw new Error(`Error upserting into ${table}: ${upsertError.message}`);
        }
      }

      restoredTables.push(table);
      totalRowsRestored += uniqueRows.length;
      await resetSequence(supabaseAdmin, table);
    }

    const logEntry = {
      occurred_at: new Date().toISOString(),
      user_id: userId,
      event_type: 'backup_restored',
      table_name: null,
      record_id: null,
      action: 'restore',
      details: {
        tables_restored: restoredTables,
        total_rows_restored: totalRowsRestored,
        timestamp: new Date().toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
      }
    };

    try {
      const { error } = await supabaseAdmin.from("system_audit_logs").insert(logEntry);
      if (error) console.warn("Failed to log backup restore:", error.message);
    } catch (err) {
      console.warn("Log insertion error:", err);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Restore error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
