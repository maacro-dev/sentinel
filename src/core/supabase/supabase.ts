import { AUTH_TOKEN_KEY } from "@/features/authentication/constants";
import { Database } from "./supabase.types";
import { SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient<Database> | null = null;

export async function getSupabase(): Promise<SupabaseClient<Database>> {
  if (supabaseClient) {
    return supabaseClient;
  }

  const startTime = Date.now();
  const { createClient } = await import("@supabase/supabase-js");

  const devUrl = import.meta.env.VITE_SUPABASE_DEV_URL;
  const devKey = import.meta.env.VITE_SUPABASE_DEV_ANON_OR_PUBLISHABLE_KEY;
  const prodUrl = import.meta.env.VITE_SUPABASE_URL;
  const prodKey = import.meta.env.VITE_SUPABASE_ANON_OR_PUBLISHABLE_KEY;

  const options = {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: localStorage,
      storageKey: AUTH_TOKEN_KEY,
    },
  };

  const client = import.meta.env.DEV
    ? createClient<Database>(devUrl, devKey, options)
    : createClient<Database>(prodUrl, prodKey, options);

  supabaseClient = client;

  console.log("Supabase initialized in", Date.now() - startTime, "ms");
  return client;
}
