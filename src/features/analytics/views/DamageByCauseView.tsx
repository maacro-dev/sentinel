import { DamageByCauseData } from '../schemas/comparative/damage-cause';
import { StatCardMinimal, StatCardSparkline } from '../components/StatCard';
import { MultiLineChart } from '../components/MultiLineChart';
import { ComparisonPieChart } from '../components/ComparisonPieChart';
import { buildLineRows, DAMAGE_BASE, generateShades, normaliseCompareProps } from '../utils';
import { useMemo } from 'react';
import { useTrendData } from '../hooks/useTrendData';

interface DamageByCauseViewProps {
  data: DamageByCauseData;
  compareData?: any[];
  currentSeasonLabel?: string | null;
  compareSeasonLabels?: string[];
  compareSeasonLabel?: string | null;
  comparisonStats?: any[];
  isLoading?: boolean;
}

const STAT_METRICS = [
  { key: 'totalReports', title: 'Total Reports', subtitle: 'All damage incidents', unit: '' },
  { key: 'totalArea', title: 'Total Affected Area', subtitle: 'Sum of affected area', unit: 'ha' },
  { key: 'causesCount', title: 'Distinct Causes', subtitle: 'Types of damage', unit: '' },
  { key: 'avgArea', title: 'Avg Area per Cause', subtitle: 'Mean affected area', unit: 'ha' },
] as const;

export function DamageByCauseView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabels,
  compareSeasonLabel,
  comparisonStats,
  isLoading = false,
}: DamageByCauseViewProps) {
  const { cmpLabels, cmpDataItems, hasComparison, primaryStats, compareStatsList } =
    normaliseCompareProps({ compareData, comparisonStats, compareSeasonLabels, compareSeasonLabel });

  const currentLabel = currentSeasonLabel ?? 'Current Season';
  const isAllSeasons = currentLabel === 'All Seasons';

  const { total_damage_reports: totalReports, total_affected_area_ha: totalArea } = data;
  const causesCount = data.ranking.length;
  const avgArea = causesCount > 0 ? totalArea / causesCount : 0;

  // ── Multi‑line chart data ──
  const primaryRanking = useMemo(
    () => data.ranking.map(r => ({ location: r.cause, yield: r.total_affected_area })),
    [data.ranking],
  );

  const transformedCmpData = useMemo(() =>
    hasComparison
      ? cmpDataItems.map((items: any[]) =>
        Array.isArray(items)
          ? items.map((item: any) => ({ location: item.cause, yield: item.compare ?? 0 }))
          : [],
      )
      : [],
    [hasComparison, cmpDataItems],
  );

  const { rows: lineRows, locationKeys } = useMemo(
    () =>
      buildLineRows(
        primaryRanking,
        currentLabel,
        transformedCmpData,
        hasComparison ? cmpLabels : [],
        !isAllSeasons,
      ),
    [primaryRanking, currentLabel, transformedCmpData, hasComparison, cmpLabels, isAllSeasons],
  );

  const locationShades = useMemo(
    () => generateShades(DAMAGE_BASE, locationKeys.length),
    [locationKeys.length],
  );

  const seasonColorMap = useMemo<Record<string, string>>(() => {
    const list: string[] = [];
    if (!isAllSeasons) list.push(currentLabel);
    list.push(...cmpLabels);
    const shades = generateShades(DAMAGE_BASE, list.length);   // <-- red instead of HUMAY_BASE
    const map: Record<string, string> = {};
    list.forEach((s, i) => { map[s] = shades[i % shades.length]; });
    return map;
  }, [isAllSeasons, currentLabel, cmpLabels]);

  // ── Pie chart data (only seasons with non‑zero values) ──
  const pieDataByMetric = useMemo(() =>
    Object.fromEntries(
      STAT_METRICS.map(({ key, unit }) => {
        const entries: { name: string; value: number; fill: string }[] = [];

        if (!isAllSeasons && primaryStats?.[key] != null && primaryStats[key] > 0) {
          entries.push({
            name: currentLabel,
            value: primaryStats[key],
            fill: seasonColorMap[currentLabel],
          });
        }

        compareStatsList.forEach((stats: any, i: number) => {
          if (stats?.[key] != null && stats[key] > 0) {
            entries.push({
              name: cmpLabels[i],
              value: stats[key],
              fill: seasonColorMap[cmpLabels[i]],
            });
          }
        });

        return [key, { data: entries, insight: buildInsight(entries, key, unit) }];
      }),
    ),
    [isAllSeasons, currentLabel, primaryStats, compareStatsList, cmpLabels, seasonColorMap],
  );

  // ── Trend data for sparklines ──
  const trends = useTrendData(
    compareStatsList,
    cmpLabels,
    primaryStats,
    currentLabel,
    isAllSeasons,
    ['totalReports', 'totalArea', 'causesCount', 'avgArea'],
  );

  // ── Warning for comparison seasons with zero damage ──
  const emptyComparisonSeasons = hasComparison
    ? cmpDataItems
      .map((items, i) => (Array.isArray(items) && items.every((item: any) => item.compare === 0) ? cmpLabels[i] : null))
      .filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-4">

      {emptyComparisonSeasons.length > 0 && (
        <div className="w-full py-2 rounded-container px-3 border text-xs font-medium bg-amber-100 border-amber-600 text-amber-600">
          No damage records found for {emptyComparisonSeasons.join(', ')}. Showing only current season data for those seasons.
        </div>
      )}

      {/* Overall sparkline cards – always for All Seasons */}
      {isAllSeasons && (
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatCardSparkline
            title="Overall Total Reports"
            subtitle="All damage incidents across seasons"
            value={totalReports}
            unit=""
            trend={trends.totalReports}
            inverted
          />
          <StatCardSparkline
            title="Overall Total Affected Area"
            subtitle="Sum of affected area"
            value={Number(totalArea.toFixed(2))}
            unit="ha"
            trend={trends.totalArea}
            inverted
          />
          <StatCardSparkline
            title="Overall Distinct Causes"
            subtitle="Types of damage"
            value={causesCount}
            unit=""
            trend={trends.causesCount}
            inverted
          />
          <StatCardSparkline
            title="Overall Avg Area per Cause"
            subtitle="Mean affected area"
            value={Number(avgArea.toFixed(2))}
            unit="ha"
            trend={trends.avgArea}
            inverted
          />
        </div>
      )}

      {/* Plain stat cards – single season, no comparison */}
      {!isAllSeasons && !hasComparison && (
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatCardMinimal title="Total Reports" subtitle="All damage incidents" current_value={totalReports} unit="" />
          <StatCardMinimal title="Total Affected Area" subtitle="Sum of affected area" current_value={Number(totalArea.toFixed(2))} unit="ha" />
          <StatCardMinimal title="Distinct Causes" subtitle="Types of damage" current_value={causesCount} unit="" />
          <StatCardMinimal title="Avg Area per Cause" subtitle="Mean affected area" current_value={Number(avgArea.toFixed(2))} unit="ha" />
        </div>
      )}

      {/* Pie charts – any comparison active */}
      {hasComparison && (
        <div className="grid auto-rows-min gap-4 md:grid-cols-4 transition-opacity duration-200">
          {STAT_METRICS.map(({ key, title, subtitle, unit }) => {
            const { data: pieData, insight } = pieDataByMetric[key];
            return (
              <ComparisonPieChart
                key={key}
                data={pieData}
                title={title}
                description={subtitle}
                valueUnit={unit}
                insight={insight}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      )}

      {/* Multi‑line chart */}
      {locationKeys.length > 0 && (
        <MultiLineChart
          key={`damage-cause-${locationKeys.length}`}
          data={lineRows}
          categoryKey="season"
          containerClass="h-120"
          lineKeys={locationKeys}
          colors={locationShades}
          valueUnit="ha"
          isLoading={isLoading}
          header={{
            title: 'Damage by Cause',
            description: hasComparison
              ? `${currentLabel} vs ${cmpLabels.join(', ')}`
              : currentLabel,
          }}
        />
      )}
    </div>
  );
}

// ── Insight builder (mirrors location view) ──
function buildInsight(
  data: { name: string; value: number }[],
  metric: string,
  unit: string,
): string {
  if (data.length === 0) return '';
  if (data.length === 1) {
    return `${data[0].name} recorded ${data[0].value.toFixed(metric === 'causesCount' ? 0 : 2)} ${unit}.`;
  }
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = sorted[0];
  const min = sorted[sorted.length - 1];
  switch (metric) {
    case 'totalReports':
      return `${max.name} had the most reports (${max.value}), while ${min.name} had the fewest (${min.value}).`;
    case 'totalArea':
      return `${max.name} had the largest affected area (${max.value.toFixed(2)} ${unit}), while ${min.name} had the smallest (${min.value.toFixed(2)} ${unit}).`;
    case 'causesCount':
      return `${max.name} had damage in ${max.value} causes. ${min.name} was affected in ${min.value} causes.`;
    case 'avgArea':
      return `${max.name} has the highest average area per cause (${max.value.toFixed(2)} ${unit}); ${min.name} has the lowest (${min.value.toFixed(2)} ${unit}).`;
    default:
      return '';
  }
}
