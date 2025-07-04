import { RoleID } from "@constants"
import { getAdminAuthClient } from "@clients"
import { preflight, response } from "@http"

Deno.serve(async (req) => {
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
  });

  if (error || !data) {
    if (error?.status === 422 && error.message.includes("email")) {
      return response({ error: "Email already in use" }, error.status);
    }

    return response({ error: error?.message }, error?.status);
  }

  const { user } = data;

  const { error: userError } = await supabase
    .from("users")
    .insert({
      auth_id: user.id,
      first_name: first_name,
      last_name: last_name,
      role_id: RoleID[role as keyof typeof RoleID],
      date_of_birth: date_of_birth,
    });

  if (userError) {
    return response({ error: userError.message }, 500);
  }

  return response({ success: true, message: "User created successfully" });
});
