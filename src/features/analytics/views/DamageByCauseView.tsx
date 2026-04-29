
import { StatCardComparison, StatCardMinimal } from '../components/StatCard';
import { GroupedBarChart } from '../components/GroupedBarChart/GroupedBarChart';
import { Lightbulb } from 'lucide-react';
import { DamageByCauseData } from '../schemas/comparative/damage-cause';
import { buildBarKeys, normaliseCompareProps } from '../utils';

function buildGroupedRows(
  primaryRanking: { cause: string; total_affected_area: number }[],
  cmpDataItems: any[]
): Record<string, any>[] {
  const rowMap = new Map<string, Record<string, any>>();
  for (const item of primaryRanking) {
    rowMap.set(item.cause, { cause: item.cause, current: Number(item.total_affected_area.toFixed(2)) });
  }
  for (let i = 0; i < cmpDataItems.length; i++) {
    const items = cmpDataItems[i];
    if (!Array.isArray(items)) continue;
    const key = `compare_${i}`;
    for (const item of items) {
      const c = item.cause as string;
      if (!rowMap.has(c)) rowMap.set(c, { cause: c, current: 0 });
      rowMap.get(c)![key] = Number((item.compare ?? 0).toFixed(2));
    }
  }
  return Array.from(rowMap.values());
}

function buildInsight(
  currentLabel: string,
  currentTotal: number,
  cmpLabels: string[],
  cmpStatsList: any[]
): string {
  const parts = cmpLabels.map((label, i) => {
    const cmp = cmpStatsList[i]?.totalArea ?? 0;
    const diff = ((currentTotal - cmp) / (cmp || 1)) * 100;
    return `${Math.abs(diff).toFixed(1)}% ${diff >= 0 ? 'more' : 'less'} than ${label} (${cmp.toFixed(2)} ha)`;
  });
  return `${currentLabel}'s total affected area (${currentTotal.toFixed(2)} ha) is ${parts.join(', and ')}.`;
}

export function DamageByCauseView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabels,
  compareSeasonLabel,
  comparisonStats,
}: {
  data: DamageByCauseData;
  compareData?: any[];
  currentSeasonLabel?: string | null;
  compareSeasonLabels?: string[];
  compareSeasonLabel?: string | null;
  comparisonStats?: any[];
}) {
  const { cmpLabels, cmpDataItems, hasComparison, primaryStats, compareStatsList } =
    normaliseCompareProps({ compareData, comparisonStats, compareSeasonLabels, compareSeasonLabel });

  const currentLabel = currentSeasonLabel ?? "Current Season";

  const isComparisonEmpty = hasComparison &&
    cmpDataItems.every(items => !Array.isArray(items) || items.every((item: any) => item.compare === 0));

  const groupedRows = hasComparison
    ? buildGroupedRows(data.ranking, cmpDataItems)
    : data.ranking.map(item => ({ cause: item.cause, current: Number(item.total_affected_area.toFixed(2)) }));

  const barKeys = buildBarKeys(currentLabel, hasComparison ? cmpLabels : []);

  const totalReports  = data.total_damage_reports;
  const totalArea     = data.total_affected_area_ha;
  const highestCount  = data.highest_damage_count;
  const highestArea   = data.highest_affected_area;
  const causeCount    = data.ranking.length;

  const insightText = hasComparison && primaryStats
    ? buildInsight(currentLabel, primaryStats.totalArea ?? totalArea, cmpLabels, compareStatsList)
    : null;

  const STAT_METRICS = [
    { key: "totalReports", title: "Total Reports",       subtitle: "All damage incidents", unit: "reports" },
    { key: "totalArea",    title: "Total Affected Area", subtitle: "Sum of affected area", unit: "ha" },
    { key: "causesCount",  title: "Distinct Causes",     subtitle: "Types of damage",      unit: "causes" },
    { key: "avgArea",      title: "Avg Area per Cause",  subtitle: "Mean affected area",   unit: "ha" },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      {isComparisonEmpty && (
        <div className="w-full py-2 rounded-container px-3 border text-xs font-medium bg-amber-100 border-amber-600 text-amber-600">
          No damage records found for {cmpLabels.filter((_, i) =>
            cmpDataItems[i]?.every?.((item: any) => item.compare === 0)
          ).join(', ')}. Showing only current season data for those seasons.
        </div>
      )}

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
            <StatCardMinimal title="Total Reports"       subtitle="All damage incidents" current_value={totalReports}                    unit="reports" />
            <StatCardMinimal title="Total Affected Area" subtitle="Sum of affected area" current_value={Number(totalArea.toFixed(2))}    unit="ha" />
            <StatCardMinimal title="Most Frequent Cause" subtitle={highestCount?.cause ?? 'N/A'}  current_value={highestCount?.value ?? 0}       unit="reports" />
            <StatCardMinimal title="Largest Area Cause"  subtitle={highestArea?.cause ?? 'N/A'}   current_value={highestArea ? Number(highestArea.value.toFixed(2)) : 0} unit="ha" />
          </>
        )}
      </div>

      <GroupedBarChart
        data={groupedRows}
        header={{
          title: "Damage by Cause",
          description: hasComparison
            ? `${currentLabel} vs ${cmpLabels.join(', ')}`
            : "Affected area per cause",
        }}
        categoryKey="cause"
        barKeys={barKeys}
        valueUnit="ha"
        cardClass="min-h-120"
      />

      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
        <Lightbulb className="size-4 mt-0.5 shrink-0" />
        <p>
          {insightText ?? (
            causeCount === 1 ? (
              <>
                Only <span className="font-medium text-foreground">{data.ranking[0].cause}</span> is recorded,
                with <span className="font-medium text-foreground">{totalReports} report{totalReports !== 1 ? 's' : ''}</span>{' '}
                affecting <span className="font-medium text-foreground">{totalArea.toFixed(2)} ha</span>.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{highestCount?.cause}</span> is the most frequent ({highestCount?.value} reports),
                while <span className="font-medium text-foreground">{highestArea?.cause}</span> causes the largest area ({highestArea?.value.toFixed(2)} ha).
                In total, <span className="font-medium text-foreground">{causeCount}</span> distinct causes account for{' '}
                <span className="font-medium text-foreground">{totalReports}</span> reports and{' '}
                <span className="font-medium text-foreground">{totalArea.toFixed(2)} ha</span>.
              </>
            )
          )}
        </p>
      </div>
    </div>
  );
}
