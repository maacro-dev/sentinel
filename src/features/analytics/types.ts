import type { Flatten, KeyPath } from "@/core/lib/types";
import type { SeasonSummary } from "./schemas/seasonSummary";
import type { OverallYieldTrend } from "./schemas/trends/overallYield";
import type { XAxisProps, YAxisProps } from "recharts";
import type { TickItem } from "recharts/types/util/types";
import { ProvinceYield } from "./schemas/yieldByProvince";
import { CropMethodSummary } from "./schemas/summary/method";
import { RiceVarietySummary } from "./schemas/summary/variety";
import React from "react";
import { FertilizerTypeSummary } from "./schemas/summary/fertilizer-type";
import { BarangayYieldRanking } from "./schemas/barangayYield";

export type TickProps = {
  x: number | string;
  y: number | string;
  payload: TickItem;
}

export type AxisKeys<T> = {
  X: KeyPath<T>;
  Y: KeyPath<T>;
}

export type AxisOptions = Partial<{
  X: XAxisProps;
  Y: YAxisProps;
}>

export type ChartHeader = Partial<{
  title: string;
  description: string;
}>

export type TickUnit = "day" | "week" | "month" | "year";
export type TickOptions = { unit: TickUnit; step: number };

export type TimeRange = "season" | "7d" | "30d" | "90d";

export type TimeRangeOptions = { value: TimeRange; label: string };

export interface DashboardData {
  seasonalStats: SeasonSummary;
  overallYieldTrend: OverallYieldTrend;
  barangayYieldRanking: BarangayYieldRanking;
}

export interface DescriptiveAnalyticsData {
  provinceYields: Array<ProvinceYield>;
  cropMethodSummary: CropMethodSummary;
  riceVarietySummary: RiceVarietySummary;
  fertilizerTypeSummary: FertilizerTypeSummary
}

export type SummaryConfig = Record<string, StatMetadata>;

export type Stat = Flatten<StatMetadata & { current_value: number | string; previous_value: number; percent_change: number; }>;

export interface StatMetadata {
  title: string;
  subtitle: string;
  unit: string;
}

export type PredictiveView = "forecast" | "general"

export type ComparativeView = "yield-location" | "yield-method" | "yield-variety" | "damage-location" | "damage-cause"

export type ComparativeViewProps = { data?: any; isLoading: boolean }

export type ComparativeViewComponent = React.ComponentType<ComparativeViewProps>

export interface ComparativeDataParams {
    seasonId: number | undefined,
    province: string | undefined,
    municipality: string | undefined,
    barangay: string | undefined,
    method: string | undefined,
    variety: string | undefined,
}

export interface PredictiveDataParams {
    seasonId: number | undefined,
    province: string | undefined,
    municipality: string | undefined,
    barangay: string | undefined,
    method: string | undefined,
    variety: string | undefined,
}


export interface LocationFilters {
  province: string;
  municipality: string;
  barangay: string;
}

export interface MoreFilters {
  variety: string[];   // 'NSIC', 'PSB', 'Others'
  method: string[];    // 'direct-seeded', 'transplanted'
}
