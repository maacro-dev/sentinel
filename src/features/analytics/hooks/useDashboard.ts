import { useQuery } from "@tanstack/react-query"
import {
  dashboardDataOptions
} from "@/features/analytics/queries/options"
import { mapSeasonSummary } from "../utils"
import { Stat } from "../types"
import { DASHBOARD_SUMMARY_CONFIG } from "../config"

export const useAnalyticsDashboard = () => {

const { data, isLoading, refetch: refetchDashboard } = useQuery(dashboardDataOptions())

  const seasonalStats: Array<Stat> = mapSeasonSummary({
    config: DASHBOARD_SUMMARY_CONFIG,
    stats: data?.seasonalStats
  })

  return {
    stats: seasonalStats || [],
    trends: data?.overallYieldTrend.data,
    ranks: data?.barangayYieldRanking,
    isLoading,
    refetchDashboard
  }
}
