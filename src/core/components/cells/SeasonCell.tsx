import { useSeason } from "@/features/fields/hooks/useSeasons";
import { formatSeasonLabel } from "@/features/fields/util";

export function SeasonCell({ seasonId }: { seasonId: number }) {
  const { data: season, isLoading } = useSeason(seasonId);

  if (isLoading || !season) {
    return <span className="text-muted-foreground">…</span>;
  }

  return <span>{formatSeasonLabel(season)}</span>;
}
