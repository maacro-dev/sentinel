import { supabase } from "@/app/supabase";
import { AuthError } from "@supabase/supabase-js";

export async function signInUser(
  email: string,
  password: string
): Promise<AuthError | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error;
}

export async function signOutUser(): Promise<AuthError | null> {
  const { error } = await supabase.auth.signOut();
  return error;
}
