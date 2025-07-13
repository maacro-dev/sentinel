import { getSupabase } from "@/app/supabase";
import { seasonYieldTimeSeriesSchema } from "@/lib/schemas/analytics";
import { Result, SeasonYieldTimeSeries } from "@/lib/types";
import { validateResponse } from "@/utils";


export async function getSeasonYieldTimeSeries(): Promise<Result<SeasonYieldTimeSeries>> {

  const supabase = await getSupabase();
  const query = supabase
    .schema("analytics")
    .from("harvest_yield_timeseries")
    .select("*")

  const { data, error } = await query;

  return validateResponse({
    data: data,
    schema: seasonYieldTimeSeriesSchema,
    error: error,
    fallbackMsg: "Failed to load season yield time series",
  });
}
