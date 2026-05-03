import { useCallback } from 'react';
import { yieldByLocationOptions, yieldByMethodOptions, yieldByVarietyOptions, damageByLocationOptions, damageByCauseOptions } from '../queries/options';
import { ComparativeDataParams } from '../types';
import { useQueryClient } from '@tanstack/react-query';

export function useComparativePrefetch(
  sharedFilters: ComparativeDataParams,
  level: 'province' | 'municipality' | 'barangay',
) {
  const queryClient = useQueryClient()

  return useCallback((locationKey: string) => {
    if (!locationKey) return;

    const params: ComparativeDataParams = {
      ...sharedFilters,
      province: level === 'province' ? locationKey : sharedFilters.province,
      municipality: level === 'municipality'
        ? locationKey
        : level === 'barangay'
          ? sharedFilters.municipality
          : undefined,
      barangay: level === 'barangay' ? locationKey : undefined,
    };

    queryClient.prefetchQuery(yieldByLocationOptions(params));
    queryClient.prefetchQuery(yieldByMethodOptions(params));
    queryClient.prefetchQuery(yieldByVarietyOptions(params));
    queryClient.prefetchQuery(damageByLocationOptions(params));
    queryClient.prefetchQuery(damageByCauseOptions(params));

  }, [sharedFilters, level, queryClient]);
}
