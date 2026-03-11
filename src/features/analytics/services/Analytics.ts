import { DashboardData, DescriptiveAnalyticsData } from "../types";
import { getSupabase } from "@/core/supabase";
import { parseDataCollectionTrend } from "../schemas/trends/dataCollectionTrend";
import { parseBarangayYieldRanking } from "../schemas/barangayYield";
import { parseSeasonSummary } from "../schemas/seasonSummary";
import { parseOverallYieldTrend } from "../schemas/trends/overallYield";
import { parseProvinceYields } from "../schemas/yieldByProvince";
import { parseFormCountSummary } from "../schemas/summary/formCount";
import { parseCropMethodSummary } from "../schemas/summary/method";
import { parseRiceVarietySummary } from "../schemas/summary/variety";
import { parseYieldByLocationData, YieldByLocationData } from "../schemas/comparative/yield-location";
import { parseYieldByMethodData, YieldByMethodData } from "../schemas/comparative/yield-method";
import { parseYieldVarietyData, YieldVarietyData } from "../schemas/comparative/yield-variety";

export class Analytics {
  public static async getDashboardData(seasonId?: number): Promise<DashboardData> {
    const client = await this._client;

    const { data: stats, error: seasonalError } = await client
      .schema('analytics')
      .rpc('dashboard_summary', { p_season_id: seasonId });

    const { data: overallYield, error: yieldError } = await client
      .schema('analytics')
      .rpc('trend_overall_yield', { p_season_id: seasonId });

    const { data: barangayYield, error: barangayError } = await client
      .schema('analytics')
      .rpc('dashboard_barangay_yield_rankings', { p_season_id: seasonId });

    if (seasonalError || yieldError || barangayError) {
      throw new Error("Error fetching dashboard data");
    }

    const seasonalStats = parseSeasonSummary(stats);
    const overallYieldTrend = parseOverallYieldTrend(overallYield);
    const barangayYieldRanking = parseBarangayYieldRanking(barangayYield);

    return { seasonalStats, overallYieldTrend, barangayYieldRanking };
  }

  public static async getFormProgressSummary(seasonId?: number) {
    const client = await this._client;

    const { data, error } = await client
      .schema('analytics')
      .rpc('summary_form_progress', { p_season_id: seasonId });

    if (error) throw error;
    return parseSeasonSummary(data);
  }

  public static async getFormCountSummary(seasonId?: number) {
    const client = await this._client;

    const { data, error } = await client
      .schema('analytics')
      .rpc('summary_form_count', { p_season_id: seasonId });

    if (error) {
      throw error;
    }

    const formCountSummary = parseFormCountSummary(data);
    return formCountSummary;
  }

  public static async getDataCollectionTrend(seasonId?: number) {
    const client = await this._client;
    const { data, error } = await client
      .schema('analytics')
      .rpc('trend_data_collection', { p_season_id: seasonId });

    if (error) {
      throw error
    }

    return parseDataCollectionTrend(data);
  }


  public static async getDescriptiveAnalyticsData(seasonId?: number): Promise<DescriptiveAnalyticsData> {
    const client = await this._client;

    const { data: provinceYieldsRaw, error: provinceYieldsError } = await client
      .schema('analytics')
      .rpc('province_yields', { p_season_id: seasonId });

    const { data: methodSummaryRaw, error: methodSummaryError } = await client
      .schema('analytics')
      .rpc('crop_establishment_method_summary', { p_season_id: seasonId });

    const { data: riceVarietyRaw, error: riceVarietyError } = await client
      .schema('analytics')
      .rpc('rice_variety_summary', { p_season_id: seasonId });

    if (provinceYieldsError || methodSummaryError || riceVarietyError) {
      throw new Error("Error fetching descriptive analytics data.");
    }

    return {
      provinceYields: parseProvinceYields(provinceYieldsRaw),
      cropMethodSummary: parseCropMethodSummary(methodSummaryRaw),
      riceVarietySummary: parseRiceVarietySummary(riceVarietyRaw),
    };
  }


  public static async getYieldByMethod(
    filters: {
      seasonId?: number;
      province?: string;
      municipality?: string;
      barangay?: string;
      method?: string;
      variety?: string;
    }
  ): Promise<YieldByMethodData> {
    const client = await this._client;
    const { data, error } = await client
      .schema('analytics')
      .rpc('yield_by_method', {
        p_season_id: filters.seasonId,
        p_province: filters.province,
        p_municipality: filters.municipality,
        p_barangay: filters.barangay,
        p_method: filters.method,
        p_variety: filters.variety,
      });
    if (error) throw new Error(`Failed to fetch yield by method: ${error.message}`);
    return parseYieldByMethodData(data);
  }

  public static async getYieldByLocation(
    filters: {
      seasonId?: number;
      province?: string;
      municipality?: string;
      barangay?: string;
      method?: string;
      variety?: string;
    }
  ): Promise<YieldByLocationData> {
    const client = await this._client;

    const { data, error } = await client
      .schema('analytics')
      .rpc('yield_by_location', {
        p_season_id: filters.seasonId,
        p_province: filters.province,
        p_municipality: filters.municipality,
        p_barangay: filters.barangay,
        p_method: filters.method,
        p_variety: filters.variety,
      });

    if (error) throw new Error(`Failed to fetch yield analytics: ${error.message}`);
    return parseYieldByLocationData(data);
  }

  public static async getYieldByVariety(
    filters: {
      seasonId?: number;
      province?: string;
      municipality?: string;
      barangay?: string;
      method?: string;
      variety?: string;
    }
  ): Promise<YieldVarietyData> {
    const client = await this._client;
    const { data, error } = await client
      .schema('analytics')
      .rpc('yield_by_variety', {
        p_season_id: filters.seasonId,
        p_province: filters.province,
        p_municipality: filters.municipality,
        p_barangay: filters.barangay,
        p_method: filters.method,
        p_variety: filters.variety,
      });
    if (error) throw new Error(`Failed to fetch yield by variety: ${error.message}`);
    return parseYieldVarietyData(data);
  }

  private static get _client() {
    return getSupabase();
  }
  private constructor() { }
}
