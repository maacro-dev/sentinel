import { useQuery } from "@tanstack/react-query";
import { yieldByVarietyOptions } from "../queries/options";
import { useMemo } from "react";

export function useComparisonYieldVarietyData(filters: {
  seasonId?: number;
  compareSeasonId?: number;
  province?: string;
  municipality?: string;
  barangay?: string;
  method?: string;
  variety?: string;
}) {
  const current = useQuery({
    ...yieldByVarietyOptions({ ...filters, seasonId: filters.seasonId }),
    enabled: !!filters.seasonId,
  });
  const compare = useQuery({
    ...yieldByVarietyOptions({ ...filters, seasonId: filters.compareSeasonId }),
    enabled: !!filters.compareSeasonId,
  });

  const isLoading = current.isLoading || compare.isLoading;
  const error = current.error || compare.error;

  const groupedData = useMemo(() => {
    if (!current.data || !compare.data) return null;
    const currentRanking = current.data.ranking;
    const compareRanking = compare.data.ranking;
    const varieties = new Set([
      ...currentRanking.map(r => r.variety),
      ...compareRanking.map(r => r.variety),
    ]);
    return Array.from(varieties).map(variety => ({
      variety,
      current: currentRanking.find(r => r.variety === variety)?.yield ?? 0,
      compare: compareRanking.find(r => r.variety === variety)?.yield ?? 0,
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

  return {
    data: groupedData,
    comparisonStats,
    compareRanking: compare.data?.ranking,
    isLoading,
    error
  };
}
