import { getSupabase } from "@/app/supabase";
import { SeasonHarvestedAreaComparisonStatSchema } from "@/lib/schemas/analytics";
import { Result, SeasonHarvestedAreaComparisonStat } from "@/lib/types";
import { validateResponse } from "@/utils";

export async function getSeasonHarvestedAreaComparisonStat(): Promise<Result<SeasonHarvestedAreaComparisonStat>> {

  const supabase = await getSupabase();
  const query = supabase
    .schema("analytics")
    .from('season_harvested_area_comparison')
    .select('*')
    .single()

  const { data, error } = await query;

  return validateResponse({
    data: data,
    schema: SeasonHarvestedAreaComparisonStatSchema,
    error: error,
    fallbackMsg: "Failed to load season harvested area comparison"
  })
}
