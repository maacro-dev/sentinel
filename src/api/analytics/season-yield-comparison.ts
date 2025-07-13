import { getSupabase } from "@/app/supabase";
import { seasonYieldComparisonStatSchema } from "@/lib/schemas/analytics";
import { Result, SeasonYieldComparisonStat } from "@/lib/types";
import { validateResponse } from "@/utils";

export async function getSeasonYieldComparisonStat(): Promise<Result<SeasonYieldComparisonStat>> {

  const supabase = await getSupabase();
  const query = supabase
    .schema("analytics")
    .from("season_yield_comparison")
    .select("*")
    .single();

  const { data, error } = await query;

  return validateResponse({
    data: data,
    schema: seasonYieldComparisonStatSchema,
    error: error,
    fallbackMsg: "Failed to load season yield comparison",
  });
}
