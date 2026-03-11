import { useQuery } from '@tanstack/react-query';
import { yieldByLocationOptions, yieldByMethodOptions, yieldByVarietyOptions } from '../queries/options';


interface YieldComparativeDataParams {
    seasonId: number | undefined,
    province: string | undefined,
    municipality: string | undefined,
    barangay: string | undefined,
    method: string | undefined,
    variety: string | undefined,
}

export function useYieldComparativeData(filters: YieldComparativeDataParams) {
  const yieldLocation = useYieldByLocation(filters);
  const yieldMethod = useYieldByMethod(filters);
  const yieldVariety = useYieldByVariety(filters);

  return {
    byLocation: yieldLocation,
    byMethod: yieldMethod,
    byVariety: yieldVariety,
  };
}

export const useYieldByLocation = (filters: Parameters<typeof yieldByLocationOptions>[0]) => {
  const { data, isLoading, error } = useQuery(yieldByLocationOptions(filters));
  return { data, isLoading, error, };
};

export const useYieldByMethod = (filters: Parameters<typeof yieldByMethodOptions>[0]) => {
  const { data, isLoading, error } = useQuery(yieldByMethodOptions(filters));
  return { data, isLoading, error };
};

export const useYieldByVariety = (filters: Parameters<typeof yieldByVarietyOptions>[0]) => {
  const { data, isLoading, error } = useQuery(yieldByVarietyOptions(filters));
  return { data, isLoading, error };
};
