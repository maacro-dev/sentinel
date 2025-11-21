import { queryOptions } from "@tanstack/react-query";
import { Analytics } from "../services/Analytics";


export const dashboardDataOptions = () => {
  return queryOptions({
    queryKey: ["dashboard-data"] as const,
    queryFn: () => Analytics.getDashboardData(),
    refetchOnWindowFocus: true
  });
}

export const formProgressSummaryOptions = () => {
  return queryOptions({
    queryKey: ["form-summary"] as const,
    queryFn: () => Analytics.getFormProgressSummary(),
    refetchOnWindowFocus: true
  });
}

export const dataCollectionTrendOptions = () => {
  return queryOptions({
    queryKey: ["data-collection-rate"] as const,
    queryFn: () => Analytics.getDataCollectionTrend(),
    refetchOnWindowFocus: true
  });
};

export const formCountSummaryOptions = () => {
  return queryOptions({
    queryKey: ["form-count-summary"] as const,
    queryFn: () => Analytics.getFormCountSummary(),
    refetchOnWindowFocus: true
  });
}
