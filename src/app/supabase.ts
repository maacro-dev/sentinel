const supabaseUrl =
  import.meta.env.MODE === "development"
    ? "http://127.0.0.1:54321"
    : "https://lmhkgxzfqzryocbjqcfi.supabase.co";

const supabaseKey =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_SUPABASE_KEY_DEV
    : import.meta.env.VITE_SUPABASE_KEY_PROD;

async function getSupabaseClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

export { getSupabaseClient };
