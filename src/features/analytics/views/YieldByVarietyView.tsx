// @ts-nocheck

import { useMemo } from 'react';
import { StatCardComparison, StatCardMinimal } from '../components/StatCard';
import { GroupedBarChart } from '../components/GroupedBarChart/GroupedBarChart';
import { Lightbulb } from 'lucide-react';
import { YieldVarietyData } from '../schemas/comparative/yield-variety';
import { buildBarKeys, normaliseCompareProps } from '../utils';

function buildGroupedRows(
  primaryRanking: { variety: string; yield: number }[],
  cmpDataItems: any[]
): Record<string, any>[] {
  const rowMap = new Map<string, Record<string, any>>();
  for (const item of primaryRanking) {
    rowMap.set(item.variety, { variety: item.variety, current: Number(item.yield.toFixed(2)) });
  }
  for (let i = 0; i < cmpDataItems.length; i++) {
    const items = cmpDataItems[i];
    if (!Array.isArray(items)) continue;
    const key = `compare_${i}`;
    for (const item of items) {
      const v = item.variety as string;
      if (!rowMap.has(v)) rowMap.set(v, { variety: v, current: 0 });
      rowMap.get(v)![key] = Number((item.compare ?? 0).toFixed(2));
    }
  }
  return Array.from(rowMap.values());
}

function buildInsight(
  currentLabel: string,
  currentAvg: number,
  cmpLabels: string[],
  cmpStatsList: any[]
): string {
  const parts = cmpLabels.map((label, i) => {
    const cmp = cmpStatsList[i]?.avg ?? 0;
    const diff = ((currentAvg - cmp) / (cmp || 1)) * 100;
    return `${Math.abs(diff).toFixed(1)}% ${diff >= 0 ? 'higher' : 'lower'} than ${label} (${cmp.toFixed(2)} t/ha)`;
  });
  return `${currentLabel}'s average yield (${currentAvg.toFixed(2)} t/ha) is ${parts.join(', and ')}.`;
}

export function YieldByVarietyView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabels,
  compareSeasonLabel,
  comparisonStats,
}: {
  data: YieldVarietyData;
  compareData?: any[];
  currentSeasonLabel?: string | null;
  compareSeasonLabels?: string[];
  compareSeasonLabel?: string | null;
  comparisonStats?: any[];
}) {
  const { cmpLabels, cmpDataItems, hasComparison, primaryStats, compareStatsList } =
    normaliseCompareProps({ compareData, comparisonStats, compareSeasonLabels, compareSeasonLabel });

  const currentLabel = currentSeasonLabel ?? "Current Season";

  const groupedRows = hasComparison
    ? buildGroupedRows(data.ranking, cmpDataItems)
    : data.ranking.map(item => ({ variety: item.variety, current: Number(item.yield.toFixed(2)) }));

  const barKeys = buildBarKeys(currentLabel, hasComparison ? cmpLabels : []);

  const avg            = data.average_yield;
  const highestVariety = data.highest_variety;

  const insightText = hasComparison && primaryStats
    ? buildInsight(currentLabel, primaryStats.avg ?? avg, cmpLabels, compareStatsList)
    : null;

  const singleSeasonInsight = useMemo(() => {
    if (hasComparison) return null;
    const withData = data.ranking.filter(v => v.yield > 0);
    if (withData.length === 0) return "No yield data available for any variety.";
    if (withData.length === 1) {
      const v = withData[0];
      return `Only ${v.variety} has data, with an average yield of ${v.yield.toFixed(2)} t/ha.`;
    }
    const high = withData.reduce((a, b) => b.yield > a.yield ? b : a);
    const low  = withData.reduce((a, b) => b.yield < a.yield ? b : a);
    const gap  = ((high.yield - low.yield) / high.yield) * 100;
    return { high, low, gap };
  }, [data.ranking, hasComparison]);

  const STAT_METRICS = [
    { key: "avg",            title: "Average Yield",     subtitle: "Across all varieties",                               unit: "t/ha" },
    { key: "highest",        title: "Best Variety",       subtitle: primaryStats?.highestVariety ?? highestVariety?.variety ?? "N/A", unit: "t/ha" },
    { key: "totalVarieties", title: "Varieties Tracked", subtitle: "With harvest data",                                  unit: "" },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {hasComparison && primaryStats ? (
          STAT_METRICS.map(({ key, title, subtitle, unit }) => (
            <StatCardComparison
              key={key}
              title={title}
              subtitle={subtitle}
              currentValue={primaryStats[key]}
              currentUnit={unit}
              compareValue={compareStatsList[0]?.[key]}
              compareUnit={unit}
              currentLabel={currentLabel}
              compareLabel={cmpLabels[0] ?? "Comparison"}
              extraCompares={compareStatsList.slice(1).map((s, i) => ({
                value: s?.[key],
                unit,
                label: cmpLabels[i + 1] ?? `Season ${i + 2}`,
              }))}
            />
          ))
        ) : (
          <>
            <StatCardMinimal
              title="Average Yield"
              subtitle="Overall average"
              current_value={Number(avg.toFixed(2))}
              unit="t/ha"
            />
            <StatCardMinimal
              title="Highest Yield"
              subtitle={highestVariety?.variety ?? 'N/A'}
              current_value={highestVariety ? Number(highestVariety.value.toFixed(2)) : 0}
              unit="t/ha"
            />
            <StatCardMinimal
              title="Varieties Tracked"
              subtitle="With harvest data"
              current_value={data.ranking.length}
              unit=""
            />
          </>
        )}
      </div>

      <GroupedBarChart
        data={groupedRows}
        header={{
          title: "Yield by Variety",
          description: hasComparison ? `${currentLabel} vs ${cmpLabels.join(', ')}` : (currentSeasonLabel ?? "Current Season"),
        }}
        categoryKey="variety"
        barKeys={barKeys}
        valueUnit="t/ha"
        cardClass="min-h-120"
      />

      {data.ranking.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>
            {insightText ?? (
              typeof singleSeasonInsight === 'string' ? singleSeasonInsight :
              singleSeasonInsight ? (
                <>
                  <span className="font-medium text-foreground">{singleSeasonInsight.high.variety}</span> leads with{' '}
                  <span className="font-medium text-foreground">{singleSeasonInsight.high.yield.toFixed(2)} t/ha</span> average yield,
                  outperforming{' '}
                  <span className="font-medium text-foreground">{singleSeasonInsight.low.variety}</span> by{' '}
                  <span className="font-medium text-foreground">{singleSeasonInsight.gap.toFixed(1)}%</span>.{' '}
                  The overall average is <span className="font-medium text-foreground">{avg.toFixed(2)} t/ha</span>.
                </>
              ) : null
            )}
          </p>
        </div>
      )}
    </div>
  );
}
