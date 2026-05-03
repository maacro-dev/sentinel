
import { ComparativeDataParams, SeasonComparisonResult } from '@/features/analytics/types';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { fetchSeasonComparison } from "@/features/analytics/utils/comparative";

export function useComparisonResults(
  compareSeasonIds: number[],
  filters: ComparativeDataParams,
  queryClient: ReturnType<typeof useQueryClient>
): { results: SeasonComparisonResult[]; isLoading: boolean } {
  const [results, setResults] = useState<SeasonComparisonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filtersKey = useMemo(
    () => JSON.stringify({ compareSeasonIds, filters }),
    [compareSeasonIds, filters]
  );

  useEffect(() => {
    if (compareSeasonIds.length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    Promise.all(compareSeasonIds.map(compareSeasonId => fetchSeasonComparison(queryClient, { ...filters, compareSeasonId })))
      .then(fetched => {
        if (!cancelled) {
          setResults(fetched);
          setIsLoading(false);
        }
      }).catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };

  }, [filtersKey]);

  return { results, isLoading };
}



