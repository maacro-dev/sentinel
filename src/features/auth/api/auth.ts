import { supabase } from "@/app/supabase";

export async function signInUser(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return error;
}
