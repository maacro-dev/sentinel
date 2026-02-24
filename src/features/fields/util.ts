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
