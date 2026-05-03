import { useCurrentSeasonId, useSeasonLabel } from "@/features/fields/hooks/useSeasons";
import { Seasons } from "@/features/fields/services/Seasons";
import { QueryClient } from "@tanstack/react-query";
import { UseNavigateResult } from "@tanstack/react-router";
import { useMemo, useCallback, useEffect } from "react";
import { ComparativeDataParams, ComparativeView, SeasonComparisonResult } from "../types";
import { useComparisonResults } from "./useComparisonResults";

export function useSeasonComparison(
  seasonId: "all" | number | null,
  compareSeasonIds: number[] = [],
  sharedFilters: ComparativeDataParams,
  queryClient: QueryClient,
  navigate: UseNavigateResult<"/comparative">
) {

  const { data: currentSeasonId } = useCurrentSeasonId();

  const sortedCompareIds = useMemo(
    () => [...compareSeasonIds].sort((a, b) => a - b),
    [compareSeasonIds]
  );

  const { results, isLoading } = useComparisonResults(
    sortedCompareIds,
    sharedFilters,
    queryClient
  );

  const comparisonMap = useMemo(
    () => buildComparisonMap(results),
    [results]
  );

  const seasonLabelResult = useSeasonLabel(seasonId === "all" ? null : seasonId);

  const currentSeasonLabel = seasonId === "all"
    ? "All Seasons"
    : seasonLabelResult;

  const compareSeasonLabels = useSeasonLabel(sortedCompareIds);

  const setCompareIds = useCallback((ids: number[]) => {
    navigate({
      search: prev => ({ ...prev, compareSeasonIds: ids.length ? ids : undefined, }),
      replace: true,
    });
  }, []);

  const clearCompare = useCallback(() => {
    navigate({
      search: prev => ({ ...prev, compareSeasonIds: undefined }),
      replace: true,
    });
  }, []);

  useEffect(() => {
    if (seasonId !== "all") return;
    if (compareSeasonIds.length > 0) return;

    (async () => {
      const all = await Seasons.getSeasonsWithYieldData();
      const ids = all.map(s => s.id);

      if (ids.length) setCompareIds(ids);
    })();
  }, [seasonId, compareSeasonIds, setCompareIds, currentSeasonId]);


  return {
    sortedCompareIds,
    comparisonMap,
    comparisonLoading: isLoading,
    currentSeasonLabel,
    compareSeasonLabels,
    setCompareIds,
    clearCompare,
  };
}


function buildComparisonMap(
  results: SeasonComparisonResult[]
): Record<ComparativeView, { data: any[]; stats: any[]; compareRanking?: any[] }> {
  return {
    'yield-location': {
      data: results.map(r => r.yieldLocation.data),
      stats: results.map(r => r.yieldLocation.comparisonStats),
    },
    'yield-method': {
      data: results.map(r => r.yieldMethod.data),
      stats: results.map(r => r.yieldMethod.comparisonStats),
      compareRanking: results.map(r => r.yieldMethod.compareRanking),
    },
    'yield-variety': {
      data: results.map(r => r.yieldVariety.data),
      stats: results.map(r => r.yieldVariety.comparisonStats),
    },
    'damage-location': {
      data: results.map(r => r.damageLocation.data),
      stats: results.map(r => r.damageLocation.comparisonStats),
    },
    'damage-cause': {
      data: results.map(r => r.damageCause.data),
      stats: results.map(r => r.damageCause.comparisonStats),
    },
  };
}
