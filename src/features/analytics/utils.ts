import { DASHBOARD_STATS_CONFIG } from "./config";
import { SeasonalStats } from "./schemas/seasonalStats";
import { DashboardStat } from "./types";

export function mapSeasonalStats(stats?: SeasonalStats): DashboardStat[] {
  if (!stats) return [];

  return stats.stats.map(({ name, current_value, percent_change }) => {
    const { title, subtitle, unit } = DASHBOARD_STATS_CONFIG[name];

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
  return queries.some(Boolean)
}
