import { DashboardData } from "../types";
import { getSupabase } from "@/core/supabase";
import { parseDataCollectionTrend } from "../schemas/trends/dataCollectionTrend";
import { parseBarangayYieldRanking } from "../schemas/barangayYield";
import { parseSeasonSummary } from "../schemas/seasonSummary";
import { parseOverallYieldTrend } from "../schemas/trends/overallYield";
import { parseFormCountSummary } from "../schemas/summary/formCount";

export class Analytics {
  public static async getDashboardData(): Promise<DashboardData> {
    const supabase = await getSupabase();

    const { data: stats, error: seasonalError } = await supabase
      .schema('analytics')
      .rpc('dashboard_summary')

    const { data: overallYield, error: yieldError } = await supabase
      .schema('analytics')
      .from('trend_overall_yield')
      .select('*')
      .maybeSingle();

    const { data: barangayYield, error: barangayError } = await supabase
      .schema('analytics')
      .from('dashboard_barangay_yield_rankings')
      .select('*')
      .maybeSingle();

    if (seasonalError || yieldError || barangayError) {
      throw new Error("Error fetching dashboard data")
    }

    const seasonalStats = parseSeasonSummary(stats);
    const overallYieldTrend = parseOverallYieldTrend(overallYield);
    const barangayYieldRanking = parseBarangayYieldRanking(barangayYield);


    return { seasonalStats, overallYieldTrend, barangayYieldRanking };
  }

  public static async getFormProgressSummary() {
    const supabase = await getSupabase();

    const { data, error } = await supabase
      .schema('analytics')
      .rpc("summary_form_progress")

    if (error) {
      throw error;
    }

    return parseSeasonSummary(data);
  }

  public static async getFormCountSummary() {
    const supabase = await getSupabase();

    const { data, error } = await supabase
      .schema('analytics')
      .from('summary_form_count')
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    return parseFormCountSummary(data);
  }

  public static async getDataCollectionTrend(){
    const supabase = await getSupabase();

    const { data, error } = await supabase
      .schema('analytics')
      .from('trend_data_collection')
      .select('*')
      .maybeSingle();

    if (error) {
      throw error
    }

    return parseDataCollectionTrend(data);
  }

  private constructor() {}
}
