
// review soon
// @ts-nocheck

import { sanitize } from "@/core/utils/string";
import { Stat } from "./types";

export function mapSeasonSummary({ config, stats }): Stat[] {
  if (!stats) return [];

  return stats
    .filter(({ name }) => name in config)
    .map(({ name, current_value, percent_change }) => {
      const { title, subtitle, unit } = config[name];
      return {
        key: name,
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

  const hasComparison = cmpLabels.length > 0;

  const primaryStats = cmpStats[0]?.primary ?? null;
  const compareStatsList: any[] = cmpStats.map(s => s?.compare).filter(Boolean);

  return { cmpLabels, cmpDataItems, cmpStats, hasComparison, primaryStats, compareStatsList };
}


export const HUMAY_BASE = 'oklch(62.7% 0.194 149.214)';
export const DAMAGE_BASE = 'oklch(50% 0.15 25)';

export function generateShades(base: string, count: number): string[] {
  const match = base.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!match) return Array(count).fill(base);

  const [, , C, H] = match.map(Number);
  const shades: string[] = [];

  const startL = 40;
  const endL = 75;
  const step = (endL - startL) / (count - 1 || 1);

  for (let i = 0; i < count; i++) {
    const L = startL + step * i;
    shades.push(`oklch(${L.toFixed(1)}% ${C} ${H})`);
  }
  return shades;
}



export function buildLineRows(
  primaryRanking: { location: string; yield: number }[],
  currentLabel: string,
  cmpDataItems: any[],
  cmpLabels: string[],
  includePrimary: boolean = true
) {
  const allLocations = new Set<string>();
  primaryRanking.forEach(r => allLocations.add(r.location));
  cmpDataItems.forEach(items => {
    if (!Array.isArray(items)) return;
    items.forEach((item: any) => allLocations.add(item.location as string));
  });

  const originalLocations = Array.from(allLocations);
  const locationKeys = originalLocations.map(sanitize);

  const locationMap: Record<string, string> = {};
  originalLocations.forEach((loc, idx) => {
    locationMap[locationKeys[idx]] = loc;
  });

  const rows: Record<string, any>[] = [];

  cmpDataItems.forEach((items, i) => {
    const row: Record<string, any> = { season: cmpLabels[i] ?? `Season ${i + 1}` };
    originalLocations.forEach((loc, j) => {
      const sk = locationKeys[j];
      if (!Array.isArray(items)) { row[sk] = null; return; }
      const found = items.find((item: any) => item.location === loc);
      row[sk] = found ? Number((found.compare ?? found.yield ?? 0).toFixed(2)) : null;
    });
    rows.push(row);
  });

  if (includePrimary) {
    const currentRow: Record<string, any> = { season: currentLabel };
    originalLocations.forEach((loc, j) => {
      const sk = locationKeys[j];
      const found = primaryRanking.find(r => r.location === loc);
      currentRow[sk] = found ? Number(found.yield.toFixed(2)) : null;
    });
    rows.push(currentRow);
  }

  return { rows: rows, locationKeys, locationMap };
}
