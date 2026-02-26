import { useQuery } from "@tanstack/react-query"
import { Seasons } from "../services/Seasons"
import { useMemo } from "react"
import { formatSeasonLabel, getSeasonDisplayLabel, isCurrentSeason } from "../util"
import { useSearch } from "@tanstack/react-router"

export const useSeason = (id?: number) => {
  return useQuery({
    queryKey: ["season", id] as const,
    queryFn: () => Seasons.getById(id),
    staleTime: 6000 * 60 * 60,
  })
}

export const useSeasons = () => {
  return useQuery({
    queryKey: ["seasons"] as const,
    queryFn: () => Seasons.getAll(),
    staleTime: 6000 * 60 * 60,
  })
}

export function useSeasonOptions() {

  const { data: seasons = [] } = useSeasons();
  const seasonOptions = useMemo(() =>
    seasons.map(season => ({
      value: String(season.id),
      label: formatSeasonLabel(season),
    })),
    [seasons]
  );

  return { options: seasonOptions }
}


export function useCurrentSeason() {
  const { seasonId } = useSearch({ strict: false });
  const { data: seasons = [], isLoading } = useSeasons();

  const selectedSeason = useMemo(() => {
    if (!seasons.length) return undefined;
    if (seasonId) return seasons.find(s => s.id === seasonId);
    return seasons.find(s => isCurrentSeason(s)) ?? seasons[0];
  }, [seasons, seasonId]);

  const seasonLabel = useMemo(() => {
    if (!selectedSeason) return '';
    return getSeasonDisplayLabel(selectedSeason, seasons);
  }, [selectedSeason, seasons]);

  return {
    id: seasonId,
    selected: selectedSeason,
    label: seasonLabel,
    isLoading
  }
}
