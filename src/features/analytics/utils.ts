
// @ts-nocheck
// review soon


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


export const COMPARE_COLORS = [
  "var(--color-humay-bg)",
  "var(--color-humay-light)",
  "var(--color-humay-4)",
] as const;

export const PRIMARY_COLOR = "var(--color-humay)";

export interface MultiSeasonViewProps {
  data: any;
  isLoading?: boolean;
  level?: 'province' | 'municipality' | 'barangay';

  compareData?: any[];
  compareRanking?: any[];
  currentSeasonLabel: string | null;
  compareSeasonLabels?: string[];
  comparisonStats?: any[];
}

export function buildBarKeys(
  currentLabel: string,
  compareLabels: string[]
): { key: string; name: string; color: string }[] {
  return [
    { key: "current", name: currentLabel, color: PRIMARY_COLOR },
    ...compareLabels.map((label, i) => ({
      key: `compare_${i}`,
      name: label || `Season ${i + 1}`,
      color: COMPARE_COLORS[i] ?? COMPARE_COLORS[COMPARE_COLORS.length - 1],
    })),
  ];
}

export function normaliseCompareProps(props: {
  compareData?: any[];
  comparisonStats?: any[];
  compareSeasonLabels?: string[];
  compareSeasonLabel?: string | null;
}) {
  const cmpLabels: string[] =
    props.compareSeasonLabels && props.compareSeasonLabels.length > 0
      ? props.compareSeasonLabels
      : props.compareSeasonLabel
      ? [props.compareSeasonLabel]
      : [];

  const cmpDataItems: any[] = Array.isArray(props.compareData) ? props.compareData : [];
  const cmpStats: any[] = Array.isArray(props.comparisonStats) ? props.comparisonStats : [];

  const hasComparison =
    cmpLabels.length > 0 && cmpDataItems.some(d => Array.isArray(d) && d.length > 0);

  const primaryStats = cmpStats[0]?.primary ?? null;
  const compareStatsList: any[] = cmpStats.map(s => s?.compare).filter(Boolean);

  return { cmpLabels, cmpDataItems, cmpStats, hasComparison, primaryStats, compareStatsList };
}
