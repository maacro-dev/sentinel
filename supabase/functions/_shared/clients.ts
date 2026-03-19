import { createClient } from "jsr:@supabase/supabase-js";

export function getAdminAuthClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false
      },
    }
  );
}

export function getClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SECRET_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: false
      },
    }
  );
}


export function getClientWithAuthorization(request) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
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
    token: request.headers.get('Authorization').replace('Bearer ', '')!
  }
}

