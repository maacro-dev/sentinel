import { Flat } from "@/core/lib/types";

export type DashboardStat =  Flat<StatMetadata, {
  current_value: number;
  percent_change: number;
}>

export type StatMetadata = {
  title: string;
  subtitle: string;
  unit: string;
}
