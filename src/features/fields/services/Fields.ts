import { getSupabase } from "@/core/supabase";
import { parseFieldArray } from "../schemas/field";

export class Fields {
  private constructor() {}

  public static async getAll() {

    const startTime = Date.now();

    const supabase = await getSupabase();
    const query = supabase
      .from("field_details")
      .select("*")
      .order("created_at", { ascending: true });

    const { data, error } = await query
    if (error) {
      throw error
    }

    const parsedData = parseFieldArray(data)

    console.log("Fields fetched in", Date.now() - startTime, "ms");
    return parsedData
  }
}
