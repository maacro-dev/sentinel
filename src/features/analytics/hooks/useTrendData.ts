import { useMemo } from 'react';

export function useTrendData(
  compareStatsList: any[],
  cmpLabels: string[],
  primaryStats: any,
  currentLabel: string,
  isAllSeasons: boolean,
  metrics: string[]
) {
  return useMemo(() => {
    const build = (metric: string) => {
      const points: { label: string; value: number }[] = [];
      compareStatsList.forEach((stats, i) => {
        if (stats?.[metric] != null) points.push({ label: cmpLabels[i], value: stats[metric] });
      });
      if (!isAllSeasons && primaryStats?.[metric] != null)
        points.push({ label: currentLabel, value: primaryStats[metric] });
      return points;
    };

    return Object.fromEntries(metrics.map(m => [m, build(m)])) as Record<string, { label: string; value: number }[]>;
  }, [compareStatsList, primaryStats, cmpLabels, currentLabel, isAllSeasons, metrics.join(',')]);
}
