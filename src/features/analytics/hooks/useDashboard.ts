import { useQuery } from "@tanstack/react-query"
import { dashboardDataOptions } from "@/features/analytics/queries/options"
import { mapSeasonSummary } from "../utils"
import { Stat } from "../types"
import { DASHBOARD_SUMMARY_CONFIG } from "../config"

export const useAnalyticsDashboard = (seasonId?: number) => {

  const { data, isLoading } = useQuery(dashboardDataOptions(seasonId))

  const seasonalStats: Array<Stat> = mapSeasonSummary({
    config: DASHBOARD_SUMMARY_CONFIG,
    stats: data?.seasonalStats
  })


  const normalizedStats = seasonalStats.map((s) => {
    const current = Number(s.current_value);
    const percent = s.percent_change;

    const isMissingPrevious =
      percent === 100 && current !== 0 ||
      percent === 0 && current === 0;

    return {
      ...s,
      percent_change: isMissingPrevious ? undefined : percent,
    };
  });

  return {
    stats: normalizedStats || [],
    trends: data?.overallYieldTrend.data,
    ranks: data?.barangayYieldRanking,
    isLoading,
  }
}
