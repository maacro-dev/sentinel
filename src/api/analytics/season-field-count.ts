import { getSupabase } from "@/app/supabase";
import { SeasonFieldCountComparisonStatSchema } from "@/lib/schemas/analytics";
import { Result, SeasonFieldCountComparisonStat } from "@/lib/types";
import { validateResponse } from "@/utils";

export async function getSeasonFieldCountComparisonStat( ): Promise<Result<SeasonFieldCountComparisonStat>> {

  const supabase = await getSupabase();
  const query = supabase
    .schema("analytics")
    .from("season_field_count_comparison")
    .select("*")
    .single()

  const { data, error } = await query;

  return validateResponse({
    data: data,
    schema: SeasonFieldCountComparisonStatSchema,
    error: error,
    fallbackMsg: "Failed to load season field count"
  })
}
