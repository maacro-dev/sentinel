import { useQuery } from "@tanstack/react-query";
import { yieldByMethodOptions } from "../queries/options";
import { useMemo } from "react";

export function useComparisonYieldMethodData(filters: {
  seasonId?: number;
  compareSeasonId?: number;
  province?: string;
  municipality?: string;
  barangay?: string;
  method?: string;
  variety?: string;
}) {
  const current = useQuery({
    ...yieldByMethodOptions({ ...filters, seasonId: filters.seasonId }),
    enabled: !!filters.seasonId,
  });
  const compare = useQuery({
    ...yieldByMethodOptions({ ...filters, seasonId: filters.compareSeasonId }),
    enabled: !!filters.compareSeasonId,
  });

  const isLoading = current.isLoading || compare.isLoading;
  const error = current.error || compare.error;

  const groupedData = useMemo(() => {
    if (!current.data || !compare.data) return null;
    const currentRanking = current.data.ranking;
    const compareRanking = compare.data.ranking;
    const methods = ['direct-seeded', 'transplanted'];
    return methods.map(method => ({
      method: method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted',
      current: currentRanking.find(r => r.method === method)?.yield ?? 0,
      compare: compareRanking.find(r => r.method === method)?.yield ?? 0,
    }));
  }, [current.data, compare.data]);

  const comparisonStats = useMemo(() => {
    if (!current.data || !compare.data) return null;
    const currentAvg = current.data.average_yield;
    const compareAvg = compare.data.average_yield;
    const diffPercent = ((currentAvg - compareAvg) / compareAvg) * 100;
    const higher = currentAvg > compareAvg;
    return {
      currentAvg,
      compareAvg,
      diffPercent: Math.abs(diffPercent).toFixed(1),
      higher,
    };
  }, [current.data, compare.data]);

  return { data: groupedData, comparisonStats, isLoading, error };
}
