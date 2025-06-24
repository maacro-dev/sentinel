import { supabase } from "@/app/supabase";
import { PostgrestError } from "@supabase/supabase-js";

export async function updateLastActive(uid: number): Promise<PostgrestError | null> {
  const { error } = await supabase.rpc("update_user_last_active", {
    uid: uid,
  });

  return error;
}
