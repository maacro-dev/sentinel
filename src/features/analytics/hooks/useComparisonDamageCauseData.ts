import { useQuery } from "@tanstack/react-query";
import { damageByCauseOptions } from "../queries/options";
import { useMemo } from "react";

export function useComparisonDamageCauseData(filters: {
  seasonId?: number;
  compareSeasonId?: number;
  province?: string;
  municipality?: string;
  barangay?: string;
  method?: string;
  variety?: string;
}) {
  const current = useQuery({
    ...damageByCauseOptions({ ...filters, seasonId: filters.seasonId }),
    enabled: !!filters.seasonId,
  });
  const compare = useQuery({
    ...damageByCauseOptions({ ...filters, seasonId: filters.compareSeasonId }),
    enabled: !!filters.compareSeasonId,
  });

  const isLoading = current.isLoading || compare.isLoading;
  const error = current.error || compare.error;

  const groupedData = useMemo(() => {
    if (!current.data || !compare.data) return null;
    const currentRanking = current.data.ranking;
    const compareRanking = compare.data.ranking;
    const causes = new Set([
      ...currentRanking.map(r => r.cause),
      ...compareRanking.map(r => r.cause),
    ]);
    return Array.from(causes).map(cause => ({
      cause,
      current: currentRanking.find(r => r.cause === cause)?.total_affected_area ?? 0,
      compare: compareRanking.find(r => r.cause === cause)?.total_affected_area ?? 0,
    }));
  }, [current.data, compare.data]);

  const comparisonStats = useMemo(() => {
    if (!current.data || !compare.data) return null;
    const currentTotal = current.data.total_affected_area_ha;
    const compareTotal = compare.data.total_affected_area_ha;
    const diffPercent = ((currentTotal - compareTotal) / compareTotal) * 100;
    const higher = currentTotal > compareTotal;
    return {
      current: {
        totalReports: current.data.total_damage_reports,
        totalArea: currentTotal,
        causesCount: current.data.ranking.length,
        avgArea: currentTotal / (current.data.ranking.length || 1),
      },
      compare: {
        totalReports: compare.data.total_damage_reports,
        totalArea: compareTotal,
        causesCount: compare.data.ranking.length,
        avgArea: compareTotal / (compare.data.ranking.length || 1),
      },
      diffPercent: Math.abs(diffPercent).toFixed(1),
      higher,
    };
  }, [current.data, compare.data]);

  return { data: groupedData, comparisonStats, isLoading, error };
}
