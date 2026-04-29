
import { StatCardComparison, StatCardMinimal } from '../components/StatCard';
import { GroupedBarChart } from '../components/GroupedBarChart/GroupedBarChart';
import { Lightbulb } from 'lucide-react';
import { YieldByMethodData } from '../schemas/comparative/yield-method';
import { buildBarKeys, normaliseCompareProps } from '../utils';

const FORMAT_METHOD = (m: string) =>
  m === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted';

function buildGroupedRows(
  primaryRanking: YieldByMethodData['ranking'],
  cmpDataItems: any[]
): Record<string, any>[] {
  const ALL_METHODS = ['direct-seeded', 'transplanted'];

  const rowMap = new Map<string, Record<string, any>>();
  for (const m of ALL_METHODS) {
    const found = primaryRanking.find(r => r.method === m);
    rowMap.set(m, { method: FORMAT_METHOD(m), current: found ? Number(found.yield.toFixed(2)) : 0 });
  }

  for (let i = 0; i < cmpDataItems.length; i++) {
    const items = cmpDataItems[i];
    if (!Array.isArray(items)) continue;
    const key = `compare_${i}`;
    for (const item of items) {
      const rawMethod = item.method as string;
      const displayMethod = FORMAT_METHOD(rawMethod);
      if (!rowMap.has(rawMethod)) rowMap.set(rawMethod, { method: displayMethod, current: 0 });
      rowMap.get(rawMethod)![key] = Number((item.compare ?? 0).toFixed(2));
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

export function YieldByMethodView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabels,
  compareSeasonLabel,
  comparisonStats,
}: {
  data: YieldByMethodData;
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
    : data.ranking.map(item => ({
        method: FORMAT_METHOD(item.method),
        current: Number(item.yield.toFixed(2)),
      }));

  const barKeys = buildBarKeys(currentLabel, hasComparison ? cmpLabels : []);

  // Primary season helpers
  const directSeeded   = data.ranking.find(m => m.method === 'direct-seeded');
  const transplanted   = data.ranking.find(m => m.method === 'transplanted');
  const dsCount        = directSeeded?.count ?? 0;
  const tpCount        = transplanted?.count ?? 0;
  const highest        = data.highest_method;
  const lowest         = data.lowest_method;
  const gap            = data.gap_percentage;

  const insightText = hasComparison && primaryStats
    ? buildInsight(currentLabel, primaryStats.avg ?? data.average_yield, cmpLabels, compareStatsList)
    : null;

  // Stat metrics — comparison mode
  const STAT_METRICS = [
    {
      key: "avg",
      title: "Average Yield",
      subtitle: "Across all methods",
      unit: "t/ha",
      meta: undefined,
      compareMetas: undefined,
    },
    {
      key: "highest",
      title: "Best Method",
      subtitle: "Highest yielding method",
      unit: "t/ha",
      meta: primaryStats?.highestMethod
        ? FORMAT_METHOD(primaryStats.highestMethod)
        : highest ? FORMAT_METHOD(highest.method) : undefined,
      compareMetas: [
        compareStatsList[0]?.highestMethod ? FORMAT_METHOD(compareStatsList[0].highestMethod) : undefined,
        ...compareStatsList.slice(1).map((s: any) =>
          s?.highestMethod ? FORMAT_METHOD(s.highestMethod) : undefined
        ),
      ],
    },
    {
      key: "lowest",
      title: "Weakest Method",
      subtitle: "Lowest yielding method",
      unit: "t/ha",
      meta: primaryStats?.lowestMethod
        ? FORMAT_METHOD(primaryStats.lowestMethod)
        : lowest ? FORMAT_METHOD(lowest.method) : undefined,
      compareMetas: [
        compareStatsList[0]?.lowestMethod ? FORMAT_METHOD(compareStatsList[0].lowestMethod) : undefined,
        ...compareStatsList.slice(1).map((s: any) =>
          s?.lowestMethod ? FORMAT_METHOD(s.lowestMethod) : undefined
        ),
      ],
    },
    {
      key: "gap",
      title: "Method Yield Gap",
      subtitle: "Best vs Weakest",
      unit: "%",
      meta: undefined,
      compareMetas: undefined,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {hasComparison && primaryStats ? (
          STAT_METRICS.map(({ key, title, subtitle, unit, meta, compareMetas }) => (
            <StatCardComparison
              key={key}
              title={title}
              subtitle={subtitle}
              currentValue={primaryStats[key]}
              currentUnit={unit}
              currentMeta={meta}
              compareValue={compareStatsList[0]?.[key]}
              compareUnit={unit}
              compareMeta={compareMetas?.[0]}
              currentLabel={currentLabel}
              compareLabel={cmpLabels[0] ?? "Comparison"}
              extraCompares={compareStatsList.slice(1).map((s, i) => ({
                value: s?.[key],
                unit,
                label: cmpLabels[i + 1] ?? `Season ${i + 2}`,
                meta: compareMetas?.[i + 1],
              }))}
            />
          ))
        ) : (
          <>
            <StatCardMinimal
              title="Highest Yield"
              subtitle={highest ? FORMAT_METHOD(highest.method) : 'N/A'}
              current_value={highest ? Number(highest.value.toFixed(2)) : 0}
              unit="t/ha"
            />
            <StatCardMinimal
              title="Direct Seeded"
              subtitle={`${dsCount} record${dsCount !== 1 ? 's' : ''}`}
              current_value={dsCount}
              unit=""
            />
            <StatCardMinimal
              title="Transplanted"
              subtitle={`${tpCount} record${tpCount !== 1 ? 's' : ''}`}
              current_value={tpCount}
              unit=""
            />
            <StatCardMinimal
              title="Yield Gap"
              subtitle="High vs Low difference"
              current_value={Number(gap.toFixed(1))}
              unit="%"
            />
          </>
        )}
      </div>

      <GroupedBarChart
        data={groupedRows}
        header={{
          title: "Yield by Method",
          description: hasComparison ? `${currentLabel} vs ${cmpLabels.join(', ')}` : "Current Season",
        }}
        categoryKey="method"
        barKeys={barKeys}
        valueUnit="t/ha"
      />

      {data.ranking.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>
            {insightText ?? (() => {
              const methodsWithData = data.ranking.filter(m => m.yield > 0);
              if (methodsWithData.length === 0) return <>No yield data available for any method.</>;
              if (methodsWithData.length === 1) {
                const m = methodsWithData[0];
                return <>Only <span className="font-medium text-foreground">{FORMAT_METHOD(m.method)}</span> is used, with an average yield of <span className="font-medium text-foreground">{m.yield.toFixed(2)} t/ha</span>.</>;
              }
              if (!highest || !lowest || highest.value === lowest.value) {
                return <>Both methods have equal average yields of <span className="font-medium text-foreground">{highest?.value.toFixed(2)} t/ha</span>.</>;
              }
              return (
                <>
                  <span className="font-medium text-foreground">{FORMAT_METHOD(highest.method)}</span> leads with{' '}
                  <span className="font-medium text-foreground">{highest.value.toFixed(2)} t/ha</span>, outperforming{' '}
                  <span className="font-medium text-foreground">{FORMAT_METHOD(lowest.method)}</span> by{' '}
                  <span className="font-medium text-foreground">{gap.toFixed(1)}%</span>.{' '}
                  The overall average yield is <span className="font-medium text-foreground">{data.average_yield.toFixed(2)} t/ha</span>.
                </>
              );
            })()}
          </p>
        </div>
      )}
    </div>
  );
}
