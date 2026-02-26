import type { Flatten, KeyPath } from "@/core/lib/types";
import type { SeasonSummary } from "./schemas/seasonSummary";
import type { BarangayYieldRanking } from "./schemas/barangayYield";
import type { OverallYieldTrend } from "./schemas/trends/overallYield";
import type { XAxisProps, YAxisProps } from "recharts";
import type { TickItem } from "recharts/types/util/types";
import { ProvinceYield } from "./schemas/yieldByProvince";

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
  provinceYields: Array<ProvinceYield>
}

export type SummaryConfig = Record<string, StatMetadata>;
export type Stat = Flatten<StatMetadata & { current_value: number; previous_value: number; percent_change: number; }>;

export interface StatMetadata {
  title: string;
  subtitle: string;
  unit: string;
}
