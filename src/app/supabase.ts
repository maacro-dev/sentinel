const supabaseUrl = "https://lmhkgxzfqzryocbjqcfi.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

async function getSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

export { getSupabaseClient };
