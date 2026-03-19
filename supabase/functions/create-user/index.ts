import { createClient } from "jsr:@supabase/supabase-js";

// function generateTempPassword(length: number = 12): string {
//   const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$&*_";
//   const array = new Uint8Array(length);
//   crypto.getRandomValues(array);
//   return Array.from(array)
//     .map(byte => charset[byte % charset.length])
//     .join('');
// }

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
}

const responseHeaders = {
  "Content-Type": "application/json",
}

export function response(
  body: object,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, ...responseHeaders },
  });
}

export function preflight() {
  return new Response("ok", { headers: corsHeaders })
}



Deno.serve(async (req: Request) => {
  try {

    if (req.method === "OPTIONS") {
      return preflight();
    }

    const body = await req.json();

    const { first_name, last_name, email, role, date_of_birth } = body;

    const supabase = getAdminAuthClient();
    // const password = generateTempPassword();
    const password = "temporary";

    const pendingUser = {
      role: "authenticated",
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: first_name,
        last_name: last_name,
        role: role,
        date_of_birth: date_of_birth,
      },
    }

    const { data, error } = await supabase.auth.admin.createUser(pendingUser);

    if (error || !data) {
      if (error?.status === 422 && error.message.includes("email")) {
        return response({ error: "Email already in use" }, error.status);
      }

      return response({ error: error?.message }, error?.status);
    }

    // const { resetData, resetError } = await supabase.auth.resetPasswordForEmail(email)

    return response({ success: true, message: "User created successfully. Email sent." }, 200);

  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
});
