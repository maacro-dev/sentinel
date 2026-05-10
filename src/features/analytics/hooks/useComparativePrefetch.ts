import { useCallback } from 'react';
import { yieldByLocationOptions, yieldByMethodOptions, yieldByVarietyOptions, damageByLocationOptions, damageByCauseOptions } from '../queries/options';
import { ComparativeDataParams } from '../types';
import { useQueryClient } from '@tanstack/react-query';

export function useComparativePrefetch(
  sharedFilters: ComparativeDataParams,
  level: 'province' | 'municipality' | 'barangay',
) {
  const queryClient = useQueryClient();

  const prefetchLocation = useCallback((locationKey: string) => {
    if (!locationKey) return;
    const params: ComparativeDataParams = {
      ...sharedFilters,
      provinces: level === 'province'
        ? [locationKey]
        : sharedFilters.provinces,
      municipalities: level === 'municipality'
        ? [locationKey]
        : level === 'barangay'
          ? sharedFilters.municipalities
          : undefined,
      barangays: level === 'barangay' ? [locationKey] : undefined,
    };
    queryClient.prefetchQuery(yieldByLocationOptions(params));
    queryClient.prefetchQuery(yieldByMethodOptions(params));
    queryClient.prefetchQuery(yieldByVarietyOptions(params));
    queryClient.prefetchQuery(damageByLocationOptions(params));
    queryClient.prefetchQuery(damageByCauseOptions(params));
  }, [sharedFilters, level, queryClient]);

  const prefetchOption = useCallback((key: keyof Pick<ComparativeDataParams, 'provinces' | 'municipalities' | 'barangays'>, value: string) => {
    const current = sharedFilters[key] ?? [];
    if (current.includes(value)) return;
    const params: ComparativeDataParams = {
      ...sharedFilters,
      [key]: [...current, value],
    };
    queryClient.prefetchQuery(yieldByLocationOptions(params));
    queryClient.prefetchQuery(yieldByMethodOptions(params));
    queryClient.prefetchQuery(yieldByVarietyOptions(params));
    queryClient.prefetchQuery(damageByLocationOptions(params));
    queryClient.prefetchQuery(damageByCauseOptions(params));
  }, [sharedFilters, queryClient]);

  return { prefetchLocation, prefetchOption };
}
