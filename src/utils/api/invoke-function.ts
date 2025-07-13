import { getSupabase } from "@/app/supabase";
import { Result } from "@/lib/types";
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "@supabase/supabase-js";

export async function invokeFunction<T>(
  name: string,
  body: object
): Promise<Result<T>> {

  const supabase = await getSupabase();

  const { data, error } = await supabase.functions.invoke(name, { body });

  if (!error && data === null) {
    return { ok: false, error: new Error("Function returned no data") };
  }

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json();
      return { ok: false, error: new Error(payload.error ?? "Function error") };
    }
    if (error instanceof FunctionsRelayError) {
      return { ok: false, error: new Error("Internal routing error") };
    }
    if (error instanceof FunctionsFetchError) {
      return { ok: false, error: new Error("Network error") };
    }
    return { ok: false, error };
  }

  return { ok: true, data: data as T };
}
