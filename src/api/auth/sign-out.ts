import { getSupabase } from "@/app/supabase";
import { Result } from "@/lib/types";

export const supabaseSignOut = async (): Promise<Result<void>> => {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { ok: false, error };
  }
  return { ok: true, data: undefined };
};
