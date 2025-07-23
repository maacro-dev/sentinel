import { useQuery } from "@tanstack/react-query"
import {
  dashboardDataOptions
} from "@/features/analytics/queries/options"
import { mapSeasonalStats } from "../utils"
import { DashboardStat } from "../types"

export const useAnalyticsDashboard = () => {

  const { data, isLoading } = useQuery(dashboardDataOptions())

  const seasonalStats: DashboardStat[] = mapSeasonalStats(data?.seasonalStats)

  return {
    stats: seasonalStats,
    trends: data?.yieldTimeSeries,
    ranks: data?.barangayYieldRanking,
    isLoading
  }
}
