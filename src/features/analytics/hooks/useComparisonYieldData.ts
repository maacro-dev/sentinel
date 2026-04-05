import { useQuery } from "@tanstack/react-query";
import { yieldByLocationOptions } from "../queries/options";
import { useMemo } from "react";

export function useComparisonYieldData(filters: {
  seasonId?: number;
  compareSeasonId?: number;
  province?: string;
  municipality?: string;
  barangay?: string;
  method?: string;
  variety?: string;
}) {
  const primary = useQuery({
    ...yieldByLocationOptions({ ...filters, seasonId: filters.seasonId }),
    enabled: !!filters.seasonId,
  });
  const compare = useQuery({
    ...yieldByLocationOptions({ ...filters, seasonId: filters.compareSeasonId }),
    enabled: !!filters.compareSeasonId,
  });

  const isLoading = primary.isLoading || compare.isLoading;
  const error = primary.error || compare.error;

  const mergedData = useMemo(() => {
    if (!primary.data || !compare.data) return null;
    const primaryRanking = primary.data.ranking;
    const compareRanking = compare.data.ranking;
    const locations = new Set([
      ...primaryRanking.map(r => r.location),
      ...compareRanking.map(r => r.location),
    ]);
    return Array.from(locations).map(location => ({
      location,
      current: primaryRanking.find(r => r.location === location)?.yield ?? 0,
      compare: compareRanking.find(r => r.location === location)?.yield ?? 0,
    }));
  }, [primary.data, compare.data]);

  const comparisonStats = useMemo(() => {
    if (!primary.data || !compare.data) return null;
    const primaryRanking = primary.data.ranking;
    const compareRanking = compare.data.ranking;

    const primaryYields = primaryRanking.map(r => r.yield);
    const compareYields = compareRanking.map(r => r.yield);

    const primaryAvg = primaryYields.reduce((a, b) => a + b, 0) / (primaryYields.length || 1);
    const compareAvg = compareYields.reduce((a, b) => a + b, 0) / (compareYields.length || 1);

    const primaryHighest = Math.max(...primaryYields, 0);
    const compareHighest = Math.max(...compareYields, 0);
    const primaryLowest = Math.min(...primaryYields, Infinity);
    const compareLowest = Math.min(...compareYields, Infinity);

    const primaryHighestItem = primaryRanking.find(r => r.yield === primaryHighest);
    const compareHighestItem = compareRanking.find(r => r.yield === compareHighest);
    const primaryLowestItem = primaryRanking.find(r => r.yield === primaryLowest);
    const compareLowestItem = compareRanking.find(r => r.yield === compareLowest);

    const primaryGap = primaryHighest > 0 ? ((primaryHighest - primaryLowest) / primaryHighest) * 100 : 0;
    const compareGap = compareHighest > 0 ? ((compareHighest - compareLowest) / compareHighest) * 100 : 0;

    return {
      primary: {
        avg: primaryAvg,
        highest: primaryHighest,
        highestLocation: primaryHighestItem?.location,
        lowest: primaryLowest,
        lowestLocation: primaryLowestItem?.location,
        gap: primaryGap,
      },
      compare: {
        avg: compareAvg,
        highest: compareHighest,
        highestLocation: compareHighestItem?.location,
        lowest: compareLowest,
        lowestLocation: compareLowestItem?.location,
        gap: compareGap,
      },
    };
  }, [primary.data, compare.data]);

  return { data: mergedData, comparisonStats, isLoading, error };
}
