
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { descriptiveAnalyticsDataOptions } from "../queries/options";
import { DescriptiveFilters } from "../types";


export function useDescriptiveAnalytics(
  seasonId: number | undefined | null,
  filter: DescriptiveFilters
) {

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(descriptiveAnalyticsDataOptions(seasonId, filter));

  const prefetch = (overrides: Partial<DescriptiveFilters>) => {
    const targetFilter = { ...filter, ...overrides };

    queryClient.prefetchQuery(descriptiveAnalyticsDataOptions(seasonId, targetFilter));
  };

  return {
    methodSummary: data?.cropMethodSummary,
    riceVarietySummary: data?.riceVarietySummary,
    fertilizerTypeSummary: data?.fertilizerTypeSummary,
    provinceYieldsHierarchy: data?.provinceYieldsHierarchy,
    isLoading,
    prefetch,
  };
}
