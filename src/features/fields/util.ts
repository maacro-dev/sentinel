import { SeasonRow, SeasonTable } from "./schemas/seasons";

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



export const isCurrentSeason = (season: SeasonRow) => {
  const today = new Date();
  const start = new Date(season.start_date);
  const end = new Date(season.end_date);

  return today >= start && today <= end;
};


export const formatSeasonLabel = (season: SeasonRow) => {
  const start = new Date(season.start_date);
  const end = new Date(season.end_date);
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear !== endYear) {
    return `Wet ${startYear}-${endYear}`;
  } else {
    return `Dry ${startYear}`;
  }
};


export const getSeasonDisplayLabel = (
  season: SeasonRow,
  allSeasons: SeasonRow[]
): string => {
  const start = new Date(season.start_date);
  const end = new Date(season.end_date);
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  const baseLabel =
    startYear !== endYear
      ? `Wet ${startYear}-${endYear}`
      : `Dry ${startYear}`;

  if (isCurrentSeason(season)) {
    return `${baseLabel} (Current)`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureSeasons = allSeasons
    .filter(s => new Date(s.start_date) > today)
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() -
        new Date(b.start_date).getTime()
    );

  const nextSeason = futureSeasons[0];

  if (nextSeason && season.id === nextSeason.id) {
    return `${baseLabel} (Next)`;
  }

  const sorted = [...allSeasons].sort(
    (a, b) =>
      new Date(a.start_date).getTime() -
      new Date(b.start_date).getTime()
  );

  const currentSeason = allSeasons.find(isCurrentSeason);
  if (!currentSeason) return baseLabel;

  const currentIndex = sorted.findIndex(s => s.id === currentSeason.id);
  const selectedIndex = sorted.findIndex(s => s.id === season.id);

  if (selectedIndex === -1 || currentIndex === -1) return baseLabel;

  const seasonsAgo = currentIndex - selectedIndex;

  if (seasonsAgo <= 0) return baseLabel;
  if (seasonsAgo === 1) return `${baseLabel} (1 season ago)`;

  return `${baseLabel} (${seasonsAgo} seasons ago)`;
};
