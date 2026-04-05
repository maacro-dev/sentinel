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
import { DamageByLocationData, parseDamageByLocationData } from "../schemas/comparative/damage-location";
import { DamageByCauseData, parseDamageByCauseData } from "../schemas/comparative/damage-cause";
import { parseFertilizerTypeSummary } from "../schemas/summary/fertilizer-type";
import { Seasons } from "@/features/fields/services/Seasons";
import { parsePredictedYieldLocationData, PredictedYieldLocationData } from "../schemas/predictive/yield-location";
import { parseYieldForecastData, YieldForecastData } from "../schemas/predictive/forecast";
import { PredictionResponse } from "../schemas/predictive/prediction";

export class Analytics {


  public static async getDashboardData(seasonId?: number): Promise<DashboardData> {
    const client = await this._client;

    const sid = seasonId === undefined ? await Seasons.getCurrent() : seasonId

    const { data: stats, error: seasonalError } = await client.rpc('dashboard_summary', { p_season_id: sid });

    const { data: overallYield, error: yieldError } = await client.rpc('trend_overall_yield', { p_season_id: sid });

    const { data: barangayYield, error: barangayError } = await client.rpc('dashboard_barangay_yield_rankings', { p_season_id: sid });

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

    const sid = seasonId === undefined ? await Seasons.getCurrent() : seasonId

    const { data, error } = await client.rpc('summary_form_progress', { p_season_id: sid });

    if (error) throw error;
    return parseSeasonSummary(data);
  }

  public static async getFormCountSummary(seasonId?: number) {
    const client = await this._client;
    const sid = seasonId === undefined ? await Seasons.getCurrent() : seasonId;

    const { data, error } = await client.rpc('summary_form_count', { p_season_id: sid });

    if (error) throw error;

    console.log(data)

    return parseFormCountSummary(data);
  }

  public static async getDataCollectionTrend(seasonId?: number) {
    const client = await this._client;

    const sid = seasonId === undefined ? await Seasons.getCurrent() : seasonId

    const { data, error } = await client.rpc('trend_data_collection', { p_season_id: sid });

    if (error) {
      throw error
    }

    return parseDataCollectionTrend(data);
  }


  public static async getDescriptiveAnalyticsData(seasonId?: number): Promise<DescriptiveAnalyticsData> {
    const client = await this._client;

    const sid = seasonId === undefined ? await Seasons.getCurrent() : seasonId

    const { data: provinceYieldsRaw, error: provinceYieldsError } = await client.rpc('province_yields', { p_season_id: sid });

    const { data: methodSummaryRaw, error: methodSummaryError } = await client.rpc('crop_establishment_method_summary', { p_season_id: sid });

    const { data: riceVarietyRaw, error: riceVarietyError } = await client.rpc('rice_variety_summary', { p_season_id: sid });

    const { data: fertilizerTypeRaw, error: fertilizerTypeError } = await client.rpc('fertilizer_type_summary', { p_season_id: sid });

    if (provinceYieldsError || methodSummaryError || riceVarietyError || fertilizerTypeError) {
      throw new Error("Error fetching descriptive analytics data.");
    }

    return {
      provinceYields: parseProvinceYields(provinceYieldsRaw),
      cropMethodSummary: parseCropMethodSummary(methodSummaryRaw),
      riceVarietySummary: parseRiceVarietySummary(riceVarietyRaw),
      fertilizerTypeSummary: parseFertilizerTypeSummary(fertilizerTypeRaw),
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

    const sid = filters.seasonId === undefined ? await Seasons.getCurrent() : filters.seasonId

    const { data, error } = await client.rpc('yield_by_method', {
      p_season_id: sid,
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

    const sid = filters.seasonId === undefined ? await Seasons.getCurrent() : filters.seasonId

    const { data, error } = await client.rpc('yield_by_location', {
      p_season_id: sid,
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

    const sid = filters.seasonId === undefined ? await Seasons.getCurrent() : filters.seasonId

    const { data, error } = await client.rpc('yield_by_variety', {
      p_season_id: sid,
      p_province: filters.province,
      p_municipality: filters.municipality,
      p_barangay: filters.barangay,
      p_method: filters.method,
      p_variety: filters.variety,
    });
    if (error) throw new Error(`Failed to fetch yield by variety: ${error.message}`);
    return parseYieldVarietyData(data);
  }

  public static async getDamageByLocation(
    filters: {
      seasonId?: number;
      province?: string;
      municipality?: string;
      barangay?: string;
      cause?: string;
    }
  ): Promise<DamageByLocationData> {
    const client = await this._client;

    const sid = filters.seasonId === undefined ? await Seasons.getCurrent() : filters.seasonId

    const { data, error } = await client.rpc('damage_by_location', {
      p_season_id: sid,
      p_province: filters.province,
      p_municipality: filters.municipality,
      p_barangay: filters.barangay,
      p_cause: filters.cause,
    });
    if (error) throw new Error(`Failed to fetch damage by location: ${error.message}`);
    return parseDamageByLocationData(data);
  }

  public static async getDamageByCause(
    filters: {
      seasonId?: number;
      province?: string;
      municipality?: string;
      barangay?: string;
      method?: string;
      variety?: string;
    }
  ): Promise<DamageByCauseData> {
    const client = await this._client;

    const sid = filters.seasonId === undefined ? await Seasons.getCurrent() : filters.seasonId

    const { data, error } = await client.rpc('damage_by_cause', {
      p_season_id: sid,
      p_province: filters.province,
      p_municipality: filters.municipality,
      p_barangay: filters.barangay,
      p_method: filters.method,
      p_variety: filters.variety,
    });
    if (error) throw new Error(`Failed to fetch damage by cause: ${error.message}`);
    return parseDamageByCauseData(data);
  }

  public static async getPredictedYieldByLocation(
    filters: { seasonId?: number; province?: string; municipality?: string; barangay?: string; method?: string; variety?: string }
  ): Promise<PredictedYieldLocationData> {
    const client = await this._client;
    // @ts-ignore
    const { data, error } = await client.rpc('predicted_yield_by_location', {
      p_season_id: filters.seasonId,
      p_province: filters.province,
      p_municipality: filters.municipality,
      p_barangay: filters.barangay,
      p_method: filters.method,
      p_variety: filters.variety,
    });
    if (error) throw error;
    return parsePredictedYieldLocationData(data);

  }

  public static async getYieldForecast(
    filters: {
      seasonId?: number;
      province?: string;
      municipality?: string;
      barangay?: string;
      method?: string;
      variety?: string;
    }
  ): Promise<YieldForecastData> {
    const client = await this._client;

    // @ts-ignore
    const { data, error } = await client.rpc('predicted_yield_forecast', {
      p_season_id: filters.seasonId,
      p_province: filters.province,
      p_municipality: filters.municipality,
      p_barangay: filters.barangay,
      p_method: filters.method,
      p_variety: filters.variety,
    });
    if (error) throw new Error(`Failed to fetch yield forecast: ${error.message}`);
    return parseYieldForecastData(data);
  }

  public static async predictAvailableForms(seasonId?: number): Promise<PredictionResponse> {
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke("predict-forms", {
      body: { seasonId: seasonId ?? 0 },
    });
    if (error) throw error;
    return data as PredictionResponse;
  }

  private static get _client() {
    return getSupabase();
  }

  private constructor() { }
}
