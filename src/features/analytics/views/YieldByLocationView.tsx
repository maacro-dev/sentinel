import { YieldByLocationData } from '@/features/analytics/schemas/comparative/yield-location';
import { StatCardComparison, StatCardMinimal } from '../components/StatCard';
import { Lightbulb } from 'lucide-react';
import { GroupedBarChart } from '../components/GroupedBarChart/GroupedBarChart';
import { buildBarKeys, normaliseCompareProps } from '../utils';

function buildGroupedRows(
  primaryRanking: { location: string; yield: number }[],
  cmpDataItems: any[]
): Record<string, any>[] {
  const rowMap = new Map<string, Record<string, any>>();
  for (const item of primaryRanking) {
    rowMap.set(item.location, { location: item.location, current: Number(item.yield.toFixed(2)) });
  }
  for (let i = 0; i < cmpDataItems.length; i++) {
    const items = cmpDataItems[i];
    if (!Array.isArray(items)) continue;
    const key = `compare_${i}`;
    for (const item of items) {
      const loc = item.location as string;
      if (!rowMap.has(loc)) rowMap.set(loc, { location: loc, current: 0 });
      rowMap.get(loc)![key] = Number((item.compare ?? 0).toFixed(2));
    }
  }
  return Array.from(rowMap.values());
}

function buildInsight(currentLabel: string, currentAvg: number, cmpLabels: string[], cmpStatsList: any[]): string {
  const parts = cmpLabels.map((label, i) => {
    const cmp = cmpStatsList[i]?.avg ?? 0;
    const diff = ((currentAvg - cmp) / (cmp || 1)) * 100;
    return `${Math.abs(diff).toFixed(1)}% ${diff >= 0 ? 'higher' : 'lower'} than ${label} (${cmp.toFixed(2)} t/ha)`;
  });
  return `${currentLabel}'s average yield (${currentAvg.toFixed(2)} t/ha) is ${parts.join(', and ')}.`;
}

export function YieldByLocationView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabels,
  compareSeasonLabel,
  comparisonStats,
}: {
  data: YieldByLocationData;
  level?: 'province' | 'municipality' | 'barangay';
  compareData?: any[];
  currentSeasonLabel: string | null;
  compareSeasonLabels?: string[];
  compareSeasonLabel?: string | null;
  comparisonStats?: any[];
}) {
  const { cmpLabels, cmpDataItems, hasComparison, primaryStats, compareStatsList } =
    normaliseCompareProps({ compareData, comparisonStats, compareSeasonLabels, compareSeasonLabel });

  const currentLabel = currentSeasonLabel ?? "Current Season";

  const groupedRows = hasComparison
    ? buildGroupedRows(data.ranking, cmpDataItems)
    : data.ranking.map(item => ({ location: item.location, current: Number(item.yield.toFixed(2)) }));

  const barKeys = buildBarKeys(currentLabel, hasComparison ? cmpLabels : []);

  const { highest_yield: highest, lowest_yield: lowest, gap_percentage: gap, average_yield: avg } = data;
  const locationsWithData = data.ranking.filter(r => r.yield > 0).length;
  const insightText = hasComparison
    ? buildInsight(currentLabel, primaryStats?.avg ?? avg, cmpLabels, compareStatsList)
    : null;

  const STAT_METRICS = [
    { key: "avg",     title: "Average Yield (Provincial Mean)", subtitle: "Computed from province-level averages", unit: "t/ha" },
    { key: "highest", title: "Highest Yield",                   subtitle: primaryStats?.highestLocation ?? "Location", unit: "t/ha" },
    { key: "lowest",  title: "Lowest Yield",                    subtitle: primaryStats?.lowestLocation  ?? "Location", unit: "t/ha" },
    { key: "gap",     title: "Yield Gap",                       subtitle: "High vs Low difference",                   unit: "%" },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
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
            <StatCardMinimal title="Average Yield (Provincial Mean)" subtitle="Computed from province-level averages" current_value={Number(avg.toFixed(2))} unit="t/ha" />
            <StatCardMinimal title="Highest Yield" subtitle={highest?.location ?? "N/A"} current_value={highest ? Number(highest.value.toFixed(2)) : 0} unit="t/ha" />
            <StatCardMinimal title="Lowest Yield" subtitle={lowest?.location ?? "N/A"} current_value={lowest ? Number(lowest.value.toFixed(2)) : 0} unit="t/ha" />
            <StatCardMinimal title="Yield Gap" subtitle="High vs Low difference" current_value={Number(gap.toFixed(1))} unit="%" />
          </>
        )}
      </div>

      <GroupedBarChart
        data={groupedRows}
        header={{ title: "Yield by Location", description: hasComparison ? `${currentLabel} vs ${cmpLabels.join(', ')}` : "Current Season" }}
        categoryKey="location"
        barKeys={barKeys}
        valueUnit="t/ha"
      />

      {data.ranking.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>
            {insightText ?? (highest ? (
              <>
                <span className="font-medium text-foreground">{highest.location}</span> leads with{' '}
                <span className="font-medium text-foreground">{highest.value.toFixed(2)} t/ha</span>,
                outperforming <span className="font-medium text-foreground">{lowest?.location ?? 'the lowest'}</span>{' '}
                by <span className="font-medium text-foreground">{gap.toFixed(1)}%</span>.
                Overall average across <span className="font-medium text-foreground">{locationsWithData}</span>{' '}
                {locationsWithData === 1 ? 'location' : 'locations'} is{' '}
                <span className="font-medium text-foreground">{avg.toFixed(2)} t/ha</span>.
              </>
            ) : <>No yield data available for the selected filters.</>)}
          </p>
        </div>
      )}
    </div>
  );
}
