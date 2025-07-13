import { BarangayYieldTopBottomRanked, SeasonYieldTimeSeries, StatData } from "@/lib/types/analytics";
import { useManagerDashboardChartsSuspenseQueries, useManagerDashboardStatsSuspenseQueries } from "@/queries/dashboard";
import { useMemo } from "react";

interface DashboardStatsData {
  statData: StatData[]
}

export const useDashboardStats = (): DashboardStatsData => {

  const {
    formSubmissionCount,
    fieldCount,
    yieldComparison,
    irrigationComparison,
    harvestedAreaComparison
   } = useManagerDashboardStatsSuspenseQueries()

  const statData = useMemo(() => [
    {
      title: "Form Submission",
      subtitle: "Forms submitted this season",
      value: formSubmissionCount.current_forms_submitted,
      unit: "forms",
      percentChange: formSubmissionCount.percent_change,
    },
    {
      title: "Registered Fields",
      subtitle: "Fields registered this season",
      value: fieldCount.current_field_count,
      unit: "fields",
      percentChange: fieldCount.percent_change,
    },
    {
      title: "Harvested Area",
      subtitle: "Area harvested this season",
      value: harvestedAreaComparison.current_area_harvested,
      unit: "ha",
      percentChange: harvestedAreaComparison.percent_change,
    },
    {
      title: "Average Yield",
      subtitle: "Yield per hectare",
      value: yieldComparison.current_yield_t_per_ha,
      unit: "t/ha",
      percentChange: yieldComparison.percent_change,
    },
    {
      title: "Irrigation Issues",
      subtitle: "Fields requiring attention",
      value: irrigationComparison.current_not_sufficient,
      unit: "fields",
      percentChange: irrigationComparison.not_sufficient_change_pct,
    },
    {
      title: "Pest Reports",
      subtitle: "Incidents reported this season",
      value: 0,
      unit: "reports",
      percentChange: null,
    },
    {
      title: "Data Completeness",
      subtitle: "Percentage of complete data",
      value: 0,
      unit: "%",
      percentChange: null,
    },
    {
      title: "Data Quality",
      subtitle: "Quality score of data collected",
      value: 0,
      unit: "%",
      percentChange: null,
    },
  ], [formSubmissionCount, fieldCount, harvestedAreaComparison, yieldComparison, irrigationComparison]);

  return { statData }
}

interface DashboardChartsData {
  yieldData: SeasonYieldTimeSeries;
  topBarangayYield: BarangayYieldTopBottomRanked;
  bottomBarangayYield: BarangayYieldTopBottomRanked;
}

export const useDashboardCharts = (): DashboardChartsData => {

  const { yieldTimeSeries, barangayYieldTopBottom } = useManagerDashboardChartsSuspenseQueries()

  const grouped = useMemo(() => ({
    Top: barangayYieldTopBottom.filter(({ category }) => category === "Top"),
    Bottom: barangayYieldTopBottom.filter(({ category }) => category === "Bottom"),
  }), [barangayYieldTopBottom])

  return {
    yieldData:            yieldTimeSeries,
    topBarangayYield:     grouped.Top,
    bottomBarangayYield:  grouped.Bottom,
  }
}
