import { Result } from "@/lib/types";
import { PostgrestError } from "@supabase/supabase-js";
import { ZodMiniType } from "zod/v4-mini";

interface ValidateResponseProps<T> {
  data: unknown;
  schema: ZodMiniType<T>;
  error: PostgrestError | null;
  fallbackMsg: string;
}

export function validateResponse<T>({ 
  data, 
  schema, 
  error, 
  fallbackMsg,
}: ValidateResponseProps<T>): Result<T> {
  if (error) {
    return {
      ok: false,
      error: new Error(error.message ?? fallbackMsg),
    };
  }

  if (data == null) {
    return {
      ok: false,
      error: new Error(fallbackMsg),
    };
  }

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      error: new Error(`${fallbackMsg}: ${parsed.error.message}`),
    };
  }

  return { ok: true, data: parsed.data };
}


