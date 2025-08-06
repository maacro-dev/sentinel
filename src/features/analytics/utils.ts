import { SeasonSummary } from "./schemas/seasonSummary";
import { Stat, StatMetadata } from "./types";

export function mapSeasonSummary({
  config,
  stats,
}: {
  config: Record<string, StatMetadata>;
  stats?: SeasonSummary;
}): Stat[] {
  if (!stats) return [];

  return stats.data
    .filter(({ name }) => name in config)
    .map(({ name, current_value, percent_change }) => {
    const { title, subtitle, unit } = config[name];

    return {
      title,
      subtitle,
      unit,
      current_value,
      percent_change,
    };
  });
}


export function isAnyLoading(...queries: boolean[]) {
  return queries.some(Boolean);
}
