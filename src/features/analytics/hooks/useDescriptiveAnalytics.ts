
import { useQuery } from "@tanstack/react-query";
import { descriptiveAnalyticsDataOptions } from "../queries/options";


export function useDescriptiveAnalytics(
  seasonId?: number,
  filter?: {
    province?: string | null;
    municipality?: string | null;
    barangay?: string | null;
    method?: string | null;
    variety?: string | null;
    fertilizer?: string | null;
  }
) {
  const { data, isLoading } = useQuery(descriptiveAnalyticsDataOptions(seasonId, filter));
  return {
    methodSummary: data?.cropMethodSummary,
    riceVarietySummary: data?.riceVarietySummary,
    fertilizerTypeSummary: data?.fertilizerTypeSummary,
    isLoading,
  };
}
