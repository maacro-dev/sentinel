import { queryOptions } from "@tanstack/react-query";
import { Analytics } from "../services/Analytics";

export const dashboardDataOptions = () => {
  return queryOptions({
    queryKey: ["dashboard-data"] as const,
    queryFn: () => Analytics.getDashboardData(),
  });
}

export const formProgressSummaryOptions = () => {
  return queryOptions({
    queryKey: ["form-summary"] as const,
    queryFn: () => Analytics.getFormProgressSummary(),
  });
}

export const dataCollectionTrendOptions = () => {
  return queryOptions({
    queryKey: ["data-collection-rate"] as const,
    queryFn: () => Analytics.getDataCollectionTrend(),
  });
};

export const formCountSummaryOptions = () => {
  return queryOptions({
    queryKey: ["form-count-summary"] as const,
    queryFn: () => Analytics.getFormCountSummary(),
  });
}
