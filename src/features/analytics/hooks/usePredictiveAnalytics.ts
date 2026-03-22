import { queryOptions, useQuery } from '@tanstack/react-query';
import { Analytics } from '../services/Analytics';

export const predictedYieldByLocationOptions = (filters: Parameters<typeof Analytics.getPredictedYieldByLocation>[0]) =>
  queryOptions({
    queryKey: ['predicted-yield-by-location', filters] as const,
    queryFn: () => Analytics.getPredictedYieldByLocation(filters),
    staleTime: 1000 * 60 * 5,
  });



export const usePredictedYieldByLocation = (filters: Parameters<typeof predictedYieldByLocationOptions>[0]) => {
  return useQuery(predictedYieldByLocationOptions(filters));
};
