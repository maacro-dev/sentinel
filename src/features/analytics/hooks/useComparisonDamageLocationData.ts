import { useQuery } from "@tanstack/react-query";
import { damageByLocationOptions } from "../queries/options";
import { useMemo } from "react";

export function useComparisonDamageLocationData(filters: {
  seasonId?: number;
  compareSeasonId?: number;
  province?: string;
  municipality?: string;
  barangay?: string;
  method?: string;
  variety?: string;
}) {
  const current = useQuery({ ...damageByLocationOptions({ ...filters, seasonId: filters.seasonId }) });
  const compare = useQuery({ ...damageByLocationOptions({ ...filters, seasonId: filters.compareSeasonId }) });

  const isLoading = current.isLoading || compare.isLoading;
  const error = current.error || compare.error;

  const groupedData = useMemo(() => {
    if (!current.data || !compare.data) return null;
    const currentRanking = current.data.ranking;
    const compareRanking = compare.data.ranking;
    const locations = new Set([...currentRanking.map(r => r.location), ...compareRanking.map(r => r.location)]);
    return Array.from(locations).map(location => ({
      location,
      current: currentRanking.find(r => r.location === location)?.total_affected_area ?? 0,
      compare: compareRanking.find(r => r.location === location)?.total_affected_area ?? 0,
    }));
  }, [current.data, compare.data]);

  const comparisonStats = useMemo(() => {
    if (!current.data || !compare.data) return null;
    return {
      current: {
        totalReports: current.data.total_damage_reports,
        totalArea: current.data.total_affected_area_ha,
        locationsCount: current.data.ranking.length,
        avgArea: current.data.total_affected_area_ha / (current.data.ranking.length || 1),
      },
      compare: {
        totalReports: compare.data.total_damage_reports,
        totalArea: compare.data.total_affected_area_ha,
        locationsCount: compare.data.ranking.length,
        avgArea: compare.data.total_affected_area_ha / (compare.data.ranking.length || 1),
      },
    };
  }, [current.data, compare.data]);

  return { data: groupedData, comparisonStats, isLoading, error };
}
