import { supabase } from "@/app/supabase";
import { AuthError } from "@supabase/supabase-js";

export async function supabaseSignIn(email: string,password: string): Promise<AuthError | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error;
}

export async function supabaseSignOut(): Promise<AuthError | null> {
  const { error } = await supabase.auth.signOut();
  return error;
}
