import { Result } from "@/lib/types";
import { ZodMiniType } from "zod/v4-mini";

export function validateWithSchema<T>(
  raw: unknown,
  schema: ZodMiniType<T>,
  errorMessage = "Validation failed",
): Result<T> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { ok: false, error: new Error(`${errorMessage}: ${result.error.message}`) };
  }
  return { ok: true, data: result.data };
}