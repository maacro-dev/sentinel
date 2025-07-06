import { supabase } from "@/app/supabase";
import { Result } from "@/lib/types";

export const supabaseSignOut = async (): Promise<Result<void>> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { ok: false, error };
  }
  return { ok: true, data: undefined };
};