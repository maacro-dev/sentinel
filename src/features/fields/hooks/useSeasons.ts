import { useQuery } from "@tanstack/react-query"
import { Seasons } from "../services/Seasons"
import { useMemo } from "react"
import { formatSeasonLabel, getSeasonDisplayLabel, isCurrentSeason } from "../util"
import { useSearch } from "@tanstack/react-router"
import { SeasonRow } from "../schemas/seasons"

export function useSeasonLabel(seasonId?: number) {
  const { data: seasons = [] } = useSeasons();
  const season = useMemo(() => {
    if (!seasonId || !seasons) return null;
    return seasons.find(s => s.id === seasonId);
  }, [seasonId, seasons]);
  return season ? formatSeasonLabel(season) : null;
}

export const useSeason = (id?: number) => {
  return useQuery({
    queryKey: ["season", id] as const,
    queryFn: () => Seasons.getById(id),
    staleTime: Infinity,
  })
}

export const useSeasons = () => {
  return useQuery({
    queryKey: ["seasons"] as const,
    queryFn: () => Seasons.getAll(),
    staleTime: Infinity,
  })
}


export const useSeasonsWithData = () => {
  return useQuery({
    queryKey: ["seasons-with-data"] as const,
    queryFn: () => Seasons.getSeasonsWithData(),
    staleTime: Infinity,
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
  const { data: season = [], isLoading } = useSeasons();

  const selectedSeason = useMemo(() => {
    if (!season.length) return undefined;
    if (seasonId) return season.find(s => s.id === seasonId);
    return season.find(s => isCurrentSeason(s)) ?? season[0];
  }, [season, seasonId]);

  const seasonLabel = useMemo(() => {
    if (!selectedSeason) return '';
    return getSeasonDisplayLabel(selectedSeason, season);
  }, [selectedSeason, season]);

  return {
    id: seasonId,
    seasons: season,
    selected: selectedSeason,
    label: seasonLabel,
    isLoading
  }
}

export function useSeasonsForSelector(includeNextSeason: boolean = true) {
  const { data: seasonsWithData, isLoading: loadingData } = useQuery({
    queryKey: ["seasons-with-data"],
    queryFn: () => Seasons.getSeasonsWithData(),
  });

  const { data: currentSeason, isLoading: loadingCurrent } = useQuery({
    queryKey: ["current-season"],
    queryFn: async () => {
      const id = await Seasons.getCurrent();
      return id ? Seasons.getById(id) : null;
    },
  });

  const {
    data: nextSeason,
    isLoading: loadingNext,
  } = useQuery({
    queryKey: ["next-season"],
    queryFn: () => Seasons.getNextSeason(),
    enabled: includeNextSeason,
  });

  const options = useMemo(() => {
    const seasonsSet = new Map<number, SeasonRow>();

    if (seasonsWithData) {
      seasonsWithData.forEach(s => seasonsSet.set(s.id, s));
    }
    if (currentSeason) {
      seasonsSet.set(currentSeason.id, currentSeason);
    }
    if (includeNextSeason && nextSeason) {
      seasonsSet.set(nextSeason.id, nextSeason);
    }

    const seasons = Array.from(seasonsSet.values());
    seasons.sort(
      (a, b) =>
        new Date(b.start_date).getTime() -
        new Date(a.start_date).getTime()
    );

    return seasons.map(season => ({
      value: String(season.id),
      label: formatSeasonLabel(season),
    }));
  }, [seasonsWithData, currentSeason, nextSeason, includeNextSeason]);

  const isLoading =
    loadingData || loadingCurrent || (includeNextSeason && loadingNext);

  return { options, isLoading };
}

export function useSeasonsFilter(includeNextSeason = true) {
  const { data: seasonsWithData, isLoading: loadingData } = useQuery({
    queryKey: ["seasons-with-data"],
    queryFn: () => Seasons.getSeasonsWithData(),
  });

  const { data: currentSeason, isLoading: loadingCurrent } = useQuery({
    queryKey: ["current-season"],
    queryFn: async () => {
      const id = await Seasons.getCurrent();
      return id ? Seasons.getById(id) : null;
    },
  });

  const {
    data: nextSeason,
    isLoading: loadingNext,
  } = useQuery({
    queryKey: ["next-season"],
    queryFn: () => Seasons.getNextSeason(),
    enabled: includeNextSeason,
  });

  const seasons = useMemo(() => {
    const map = new Map<number, SeasonRow>();

    seasonsWithData?.forEach(s => map.set(s.id, s));
    if (currentSeason) map.set(currentSeason.id, currentSeason);
    if (includeNextSeason && nextSeason) map.set(nextSeason.id, nextSeason);

    const sorted = Array.from(map.values());
    sorted.sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime() // newest first
    );
    return sorted;
  }, [seasonsWithData, currentSeason, nextSeason, includeNextSeason]);

  return {
    seasons,
    isLoading: loadingData || loadingCurrent || (includeNextSeason && loadingNext),
  };
}


export const useCurrentSeasonId = () => {
  return useQuery({
    queryKey: ["current-season-id"],
    queryFn: () => Seasons.getCurrent(),
    staleTime: Infinity,
  });
};

export function useNextSeasonId() {
  return useQuery({
    queryKey: ["next-season-id"],
    queryFn: async () => {
      const season = await Seasons.getNextSeason();
      return season?.id ?? null;
    },
  });
}
