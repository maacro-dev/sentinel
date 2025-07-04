import { Result } from "@/lib/types";
import { PostgrestError } from "@supabase/supabase-js";

export function postgrestResult<T>(
  data: T | null,
  error: PostgrestError | null,
  fallbackMsg: string,
): Result<T> {
  if (error || data === null) {
    return {
      ok: false,
      error: new Error(error?.message ?? fallbackMsg),
    };
  }

  return {
    ok: true,
    data,
  };
}

