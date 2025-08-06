import { getAdminAuthClient } from "@clients"
import { preflight, response } from "@http"

const EMAIL_API_URL = "https://api.resend.com/emails";
const EMAIL_FROM = "sentinel.humayapp.com";
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

async function sendWelcomeEmail(to: string, pendingUser: PendingUser): Promise<void> {
  const body = {
    from: EMAIL_FROM,
    to: [to],
    subject: "Welcome, ",
    html: `<strong>Welcome to Sentinel!</strong><br><br>
           Your account has been created successfully.<br>
           <strong>Email:</strong> ${pendingUser.email}<br>
           <strong>Password:</strong> ${pendingUser.password}<br><br>
           Please log in to your account and change your password as soon as possible.<br>
           <a href="https://app.humayapp.com/login">Login to Sentinel</a><br><br>
           <strong>Note:</strong> This is a temporary password.
           Please change it after your first login.<br><br>
           <strong>Sentinel Team</strong>`,
  };

  const res = await fetch(EMAIL_API_URL, {
    method: "POST",
    headers: EMAIL_HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to send email: ${res.status} - ${errorText}`);
  }
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
    // const password = generateTempPassword();
    const password = "christiegwapainosnos";

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

    try {
      await sendWelcomeEmail(email, pendingUser);
    } catch(err) {
      return response({ success: true, message: `User created successfully. Email not sent. ${err instanceof Error ? err.message : err}` });
    }

    return response({ success: true, message: "User created successfully. Email sent." });


  } catch (err) {
    console.error("Unhandled error:", err);
    return response({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
});
