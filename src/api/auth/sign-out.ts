import { supabase } from "@/app/supabase";
import { AuthError } from "@supabase/supabase-js";

export async function supabaseSignOut(): Promise<AuthError | null> {
  const { error } = await supabase.auth.signOut();
  return error;
}
