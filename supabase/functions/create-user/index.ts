import { getAdminAuthClient } from "@clients"
import { preflight, response } from "@http"

const EMAIL_API_URL = "https://api.resend.com/emails";
const EMAIL_FROM = "sentinel@humayapp.com";
const EMAIL_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
};

type PendingUser = {
  role: string;
  email: string;
  password: string;
  email_confirm: boolean;
  user_metadata: {
    first_name: string;
    last_name: string;
    role: string;
    date_of_birth: string;
  };
};

function generateTempPassword(length: number = 12): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$&*_";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(byte => charset[byte % charset.length])
    .join('');
}


Deno.serve(async (req: Request) => {
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
    const password = generateTempPassword();

    const pendingUser = {
      role: role,
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

    const { resetData, resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://sentinel-9cf.pages.dev/recovery"
    })

    return response({ success: true, message: "User created successfully. Email sent." }, 200);

  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
});
