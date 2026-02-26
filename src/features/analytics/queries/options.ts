import { queryOptions } from "@tanstack/react-query";
import { Analytics } from "../services/Analytics";


export const dashboardDataOptions = (seasonId?: number) => {
  return queryOptions({
    queryKey: ["dashboard-data", seasonId] as const,
    queryFn: () => Analytics.getDashboardData(seasonId),
    refetchOnWindowFocus: true,
  });
}

export const formProgressSummaryOptions = (seasonId?: number) => {
  return queryOptions({
    queryKey: ["form-summary", seasonId] as const,
    queryFn: () => Analytics.getFormProgressSummary(seasonId),
    refetchOnWindowFocus: true,
  });
};

export const dataCollectionTrendOptions = (seasonId?: number) => {
  return queryOptions({
    queryKey: ["data-collection-rate", seasonId] as const,
    queryFn: () => Analytics.getDataCollectionTrend(seasonId),
    refetchOnWindowFocus: true
  });
};

export const formCountSummaryOptions = (seasonId?: number) => {
  return queryOptions({
    queryKey: ["form-count-summary", seasonId] as const,
    queryFn: () => Analytics.getFormCountSummary(seasonId),
    refetchOnWindowFocus: true
  });
}
