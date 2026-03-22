import { queryOptions, useQuery } from "@tanstack/react-query";
import { Analytics } from "../services/Analytics";

export const yieldForecastOptions = (filters: Parameters<typeof Analytics.getYieldForecast>[0]) =>
  queryOptions({
    queryKey: ['yield-forecast', filters] as const,
    queryFn: () => Analytics.getYieldForecast(filters),
    staleTime: 1000 * 60 * 5,
  });

export const useYieldForecast = (filters: Parameters<typeof yieldForecastOptions>[0]) => {
  return useQuery(yieldForecastOptions(filters));
};
