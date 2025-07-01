import { PostgrestError } from "@supabase/supabase-js";
import { ZodMiniType } from "zod/v4-mini";

export function throwOnError<T>(
  data: T | null,
  error: PostgrestError | null,
  fallbackMsg: string,
): T {
  if (error || data === null) {
    throw new Error(error?.message ?? fallbackMsg);
  }
  return data;
}

export function validateWithSchema<T>(
  raw: unknown,
  schema: ZodMiniType<T>,
  errorMessage = "Validation failed",
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    console.error(result.error);
    throw new Error(errorMessage);
  }
  return result.data;
}