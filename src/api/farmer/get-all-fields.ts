import { getSupabase } from "@/app/supabase";
import { fieldsSchema } from "@/lib/schemas/field";
import { Fields, Result } from "@/lib/types";
import { validateResponse } from "@/utils";


export async function getAllFields(): Promise<Result<Fields>> {
  const supabase = await getSupabase();
  const query = supabase
    .from("field_details")
    .select("*")
    .order("created_at", { ascending: true });

  const { data, error } = await query

  return validateResponse({
    data: data,
    schema: fieldsSchema,
    error: error,
    fallbackMsg: "Failed to load fields"
  })
}
