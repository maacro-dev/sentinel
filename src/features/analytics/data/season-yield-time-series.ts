// import { Result } from "@/core/utils/result";
// import { seasonYieldTimeSeriesSchema } from "@/core/lib/schemas/analytics";
// import { SeasonYieldTimeSeries } from "@/core/lib/types";
// import { getSupabase } from "@/core/supabase/supabase";
// import { validateResponse } from "@/utils";


// export async function getSeasonYieldTimeSeries(): Promise<Result<SeasonYieldTimeSeries>> {

//   const supabase = await getSupabase();
//   const query = supabase
//     .schema("analytics")
//     .from("harvest_yield_timeseries")
//     .select("*")

//   const { data, error } = await query;

//   return validateResponse({
//     data: data,
//     schema: seasonYieldTimeSeriesSchema,
//     error: error,
//     fallbackMsg: "Failed to load season yield time series",
//   });
// }
