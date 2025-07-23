import { getSupabase } from "@/core/supabase";
import { SeasonalStats, parseSeasonalStats } from "../schemas/seasonalStats";
import { parseYieldTimeSeries, YieldTimeSeries } from "../schemas/yieldTimeSeries";
import { parseBarangayYieldRanking } from "../schemas/barangayYield";

export class Analytics {
  private constructor() {}

  public static async getDashboardData(): Promise<{
    seasonalStats: SeasonalStats;
    yieldTimeSeries: YieldTimeSeries;
    barangayYieldRanking: any;
  }> {

    const startTime = Date.now();

    const seasonalStats = await this._getSeasonalStats();
    const yieldTimeSeries = await this._getYieldTimeSeries();
    const barangayYieldRanking = await this._getBarangayYieldRanking();

    console.log("Dashboard data fetched in", Date.now() - startTime, "ms");
    return { seasonalStats, yieldTimeSeries, barangayYieldRanking };
  }

  private static async _getSeasonalStats(): Promise<SeasonalStats> {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .schema("analytics")
      .rpc("dashboard_seasonal_stat_comparisons")

    if (error) throw error;
    return parseSeasonalStats(data);
  }

  private static async _getYieldTimeSeries(): Promise<YieldTimeSeries> {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .schema("analytics")
      .from("dashboard_yield_timeseries")
      .select("*")

    if (error) throw error;
    return parseYieldTimeSeries(data)
  }

  private static async _getBarangayYieldRanking() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .schema("analytics")
      .from("dashboard_barangay_yield_rankings")
      .select("*")
      .maybeSingle()

    if (error) throw error;
    return parseBarangayYieldRanking(data)
  }
}
