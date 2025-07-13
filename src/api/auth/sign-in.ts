import { getSupabase } from "@/app/supabase";
import { Result } from "@/lib/types";

export async function supabaseSignIn(email: string, password: string): Promise<Result<any>> { // [do not commit]
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error };
  }

  return { ok: true, data: data};
}
