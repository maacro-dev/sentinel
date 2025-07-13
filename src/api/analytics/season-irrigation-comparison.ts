import { getSupabase } from "@/app/supabase";
import { SeasonIrrigationComparisonStatSchema } from "@/lib/schemas/analytics";
import { Result, SeasonIrrigationComparisonStat } from "@/lib/types";
import { validateResponse } from "@/utils";

export async function getSeasonIrrigationComparisonStat(): Promise<Result<SeasonIrrigationComparisonStat>> {

  const supabase = await getSupabase();
  const query = supabase
    .schema("analytics")
    .from('season_irrigation_comparison')
    .select('*')
    .single()

  const { data, error } = await query;

  return validateResponse({
    data: data,
    schema: SeasonIrrigationComparisonStatSchema,
    error: error,
    fallbackMsg: "Failed to load season irrigation comparison"
  })
}
