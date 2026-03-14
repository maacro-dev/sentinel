import { useQuery } from '@tanstack/react-query';
import { yieldByLocationOptions, yieldByMethodOptions, yieldByVarietyOptions } from '../queries/options';
import { ComparativeDataParams } from '../types';


export function useYieldComparativeData(filters: ComparativeDataParams) {
  const yieldLocation = useYieldByLocation(filters);
  const yieldMethod = useYieldByMethod(filters);
  const yieldVariety = useYieldByVariety(filters);

  return {
    byLocation: yieldLocation,
    byMethod: yieldMethod,
    byVariety: yieldVariety,
  };
}

export const useYieldByLocation = (filters: ComparativeDataParams) => {
  const { data, isLoading, error } = useQuery(yieldByLocationOptions(filters));
  return { data, isLoading, error, };
};

export const useYieldByMethod = (filters: ComparativeDataParams) => {
  const { data, isLoading, error } = useQuery(yieldByMethodOptions(filters));
  return { data, isLoading, error };
};

export const useYieldByVariety = (filters: ComparativeDataParams) => {
  const { data, isLoading, error } = useQuery(yieldByVarietyOptions(filters));
  return { data, isLoading, error };
};
