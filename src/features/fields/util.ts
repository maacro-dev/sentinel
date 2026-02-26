import { formatDateShort } from "@/core/utils/date";
import { SeasonRow, SeasonTable } from "./schemas/seasons";
import { capitalizeFirst } from "@/core/utils/string";

export function findSeasonId(dateStr: string | null, seasons: SeasonTable): number | null {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  const season = seasons.find(s => {
    const start = new Date(s.start_date);
    const end = new Date(s.end_date);
    return date >= start && date <= end;
  });

  return season ? season.id : null;
}


export const formatSeasonLabel = (season: SeasonRow) => {
  const start = new Date(season.start_date);
  const end = new Date(season.end_date);
  return `${formatDateShort(start)} - ${formatDateShort(end)}`;
};


export const isCurrentSeason = (season: SeasonRow) => {
  const today = new Date();
  const start = new Date(season.start_date);
  const end = new Date(season.end_date);

  return today >= start && today <= end;
};

export const getSeasonDisplayLabel = (
  season: SeasonRow,
  allSeasons: SeasonRow[]
): string => {
  const baseLabel = `${capitalizeFirst(season.semester)} Season`;

  if (isCurrentSeason(season)) {
    return `${baseLabel} (Current)`;
  }
  const sorted = [...allSeasons].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  const currentSeason = allSeasons.find(isCurrentSeason);
  if (!currentSeason) return baseLabel;

  const currentIndex = sorted.findIndex(s => s.id === currentSeason.id);
  const selectedIndex = sorted.findIndex(s => s.id === season.id);

  if (selectedIndex === -1 || currentIndex === -1) return baseLabel;

  const seasonsAgo = currentIndex - selectedIndex; // positive if past

  if (seasonsAgo <= 0) return baseLabel; // not a past season (future or same)
  if (seasonsAgo === 1) return `${baseLabel} (1 season ago)`;
  return `${baseLabel} (${seasonsAgo} seasons ago)`;
};
