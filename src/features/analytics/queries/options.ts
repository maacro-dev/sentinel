import { queryOptions } from "@tanstack/react-query";
import { Analytics } from "../services/Analytics";

export const dashboardDataOptions = () => {
  return queryOptions({
    queryKey: ["dashboard-data"] as const,
    queryFn: () => Analytics.getDashboardData(),
  });
}

// export const dashboardStatsOptions = () => {
//   return queryOptions({
//     queryKey: ["season-dashboard-stats"] as const,
//     queryFn: () => Analytics.getSeasonalStats(),
//   });
// };

// export const yieldTimeSeriesOptions = () => {
//   return queryOptions({
//     queryKey: ["dashboard-yield-time-series"] as const,
//     queryFn: () => Analytics.getYieldTimeSeries(),
//   });
// };

// export const barangayYieldRankingOptions = () => {
//   return queryOptions({
//     queryKey: ["barangay-yield-ranking"] as const,
//     queryFn: () => Analytics.getBarangayYieldRanking(),
//   });
// };
