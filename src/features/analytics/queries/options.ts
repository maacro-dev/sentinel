import { queryOptions } from "@tanstack/react-query";
import { Analytics } from "../services/Analytics";


export const dashboardDataOptions = (seasonId?: number) => {
  return queryOptions({
    queryKey: ["dashboard-data", seasonId] as const,
    queryFn: () => Analytics.getDashboardData(seasonId),
    // refetchOnWindowFocus: true,
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

export const descriptiveAnalyticsDataOptions = (seasonId?: number) => ({
  queryKey: ['descriptive-analytics-data', seasonId] as const,
  queryFn: () => Analytics.getDescriptiveAnalyticsData(seasonId),
  refetchOnWindowFocus: true,
});


// should combine three below to a single (comparative data options)

export const yieldByLocationOptions = (filters: Parameters<typeof Analytics.getYieldByLocation>[0]) =>
  queryOptions({
    queryKey: ['yield-analytics', filters] as const,
    queryFn: () => Analytics.getYieldByLocation(filters),
    staleTime: 1000 * 60 * 5,
  });

export const yieldByMethodOptions = (filters: Parameters<typeof Analytics.getYieldByMethod>[0]) =>
  queryOptions({
    queryKey: ['yield-by-method', filters] as const,
    queryFn: () => Analytics.getYieldByMethod(filters),
    staleTime: 1000 * 60 * 5,
  });

export const yieldByVarietyOptions = (filters: Parameters<typeof Analytics.getYieldByVariety>[0]) =>
  queryOptions({
    queryKey: ['yield-by-variety', filters] as const,
    queryFn: () => Analytics.getYieldByVariety(filters),
    staleTime: 1000 * 60 * 5,
  });

export const damageByLocationOptions = (filters: Parameters<typeof Analytics.getDamageByLocation>[0]) =>
  queryOptions({
    queryKey: ['damage-by-location', filters] as const,
    queryFn: () => Analytics.getDamageByLocation(filters),
    staleTime: 1000 * 60 * 5,
  });

export const damageByCauseOptions = (filters: Parameters<typeof Analytics.getDamageByCause>[0]) =>
  queryOptions({
    queryKey: ['damage-by-cause', filters] as const,
    queryFn: () => Analytics.getDamageByCause(filters),
    staleTime: 1000 * 60 * 5,
  });
