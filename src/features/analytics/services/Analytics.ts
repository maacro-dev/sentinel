import { DashboardData } from "../types";
import { getSupabase } from "@/core/supabase";
import { parseDataCollectionTrend } from "../schemas/trends/dataCollectionTrend";
import { parseBarangayYieldRanking } from "../schemas/barangayYield";
import { parseSeasonSummary } from "../schemas/seasonSummary";
import { parseOverallYieldTrend } from "../schemas/trends/overallYield";
import { parseFormCountSummary } from "../schemas/summary/formCount";

export class Analytics {
  public static async getDashboardData(): Promise<DashboardData> {
    const client = await this._client;

    const { data: stats, error: seasonalError } = await client
      .schema('analytics')
      .rpc('dashboard_summary')

    const { data: overallYield, error: yieldError } = await client
      .schema('analytics')
      .from('trend_overall_yield')
      .select('*')
      .maybeSingle();

    const { data: barangayYield, error: barangayError } = await client
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
    const client = await this._client;

    const { data, error } = await client
      .schema('analytics')
      .rpc("summary_form_progress")

    if (error) {
      throw error;
    }

    const formProgressSummary = parseSeasonSummary(data);
    return formProgressSummary;
  }

  public static async getFormCountSummary() {
    const client = await this._client;

    const { data, error } = await client
      .schema('analytics')
      .from('summary_form_count')
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    const formCountSummary = parseFormCountSummary(data);
    return formCountSummary;
  }

  public static async getDataCollectionTrend() {
    const client = await this._client;
    const { data, error } = await client
      .schema('analytics')
      .from('trend_data_collection')
      .select('*')
      .maybeSingle();

    if (error) {
      throw error
    }

    return parseDataCollectionTrend(data);
  }

  private static get _client() {
    return getSupabase();
  }
  private constructor() { }
}
