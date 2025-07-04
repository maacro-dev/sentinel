import { createClient } from "jsr:@supabase/supabase-js";

export function getAdminAuthClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, 
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
  }
  );
}