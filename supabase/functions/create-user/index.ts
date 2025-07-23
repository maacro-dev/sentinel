import { getAdminAuthClient } from "@clients"
import { preflight, response } from "@http"

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return preflight();
    }

    const body = await req.json();

    const {
      first_name,
      last_name,
      email,
      role,
      date_of_birth,
    } = body;

    const supabase = getAdminAuthClient();
    const password = "wow-so-secure";

    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: first_name,
        last_name: last_name,
        role: role,
        date_of_birth: date_of_birth,
      },
    });

    if (error || !data) {
      if (error?.status === 422 && error.message.includes("email")) {
        return response({ error: "Email already in use" }, error.status);
      }

      return response({ error: error?.message }, error?.status);
    }

    return response({ success: true, message: "User created successfully" });

  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
});
