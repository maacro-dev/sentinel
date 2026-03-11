
import { useQuery } from "@tanstack/react-query";
import { descriptiveAnalyticsDataOptions } from "../queries/options";

export function useDescriptiveAnalytics(seasonId?: number) {
  const { data, isLoading } = useQuery(descriptiveAnalyticsDataOptions(seasonId));

  return {
    provinceYields: data?.provinceYields,
    methodSummary: data?.cropMethodSummary,
    riceVarietySummary: data?.riceVarietySummary,
    isLoading,
  };
}
