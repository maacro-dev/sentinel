import { supabase } from "@/app/supabase";
import { Result } from "@/lib/types";
import { Session } from "@supabase/supabase-js";

export async function getCurrentSession(): Promise<Result<Session>> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return { ok: false, error };
  }

  if (!data.session) {
    return { ok: false };
  }

  return { ok: true, data: data.session };
}