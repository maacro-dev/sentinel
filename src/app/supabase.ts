import { Database } from "./supabase.types";

export async function getSupabase() {

  const { createClient } = await import("@supabase/supabase-js");
  const { IS_DEV } = await import("@/lib/utils");

  const supabaseDevUrl = import.meta.env.VITE_SUPABASE_DEV_URL;
  const supabaseDevKey = import.meta.env.VITE_SUPABASE_DEV_ANON_KEY;

  const supabaseProdUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseProdKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const options = {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: localStorage,
    },
  };

  const supabase = IS_DEV
    ? createClient<Database>(supabaseDevUrl, supabaseDevKey, options)
    : createClient<Database>(supabaseProdUrl, supabaseProdKey, options);

  return supabase;
}
