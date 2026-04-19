// @ts-nocheck

import { ChartConfig } from '@/core/components/ui/chart';
import { StatCardComparison, StatCardMinimal } from '../components/StatCard';
import { GroupedBarChart } from '../components/GroupedBarChart/GroupedBarChart';
import { Lightbulb } from 'lucide-react';
import { YieldByMethodData } from '../schemas/comparative/yield-method';

export const yieldByMethodChartConfig = {
  'direct-seeded': { label: 'Direct Seeded' },
  transplanted: { label: 'Transplanted' },
  yield: { label: 'Yield (t/ha)' },
} satisfies ChartConfig;

export function YieldByMethodView({
  data,
  compareData,
  compareRanking,
  currentSeasonLabel,
  compareSeasonLabel,
  comparisonStats,
}: {
  data: YieldByMethodData;
  compareData?: any;
  compareRanking?: YieldByMethodData['ranking'];
  currentSeasonLabel?: string | null;
  compareSeasonLabel?: string | null;
  comparisonStats?: {
    currentAvg: number;
    compareAvg: number;
    diffPercent: string;
    higher: boolean;
  };
}) {
  const hasComparison = !!compareData?.length && currentSeasonLabel && compareSeasonLabel;

  const barKeys = hasComparison
    ? [
      { key: "current", name: currentSeasonLabel!, color: "var(--color-humay)" },
      { key: "compare", name: compareSeasonLabel!, color: "var(--color-humay-light)" },
    ]
    : [
      { key: "current", name: currentSeasonLabel ?? "Yield (t/ha)", color: "var(--color-humay)" },
    ];

  const chartData = hasComparison
    ? compareData
    : data.ranking.map(item => ({
      method: item.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted',
      current: Number(item.yield.toFixed(2)),
    }));

  const highestCurrent = data.highest_method;
  const directSeededCurrent = data.ranking.find(m => m.method === 'direct-seeded');
  const transplantedCurrent = data.ranking.find(m => m.method === 'transplanted');
  const dsCountCurrent = directSeededCurrent?.count ?? 0;
  const tpCountCurrent = transplantedCurrent?.count ?? 0;
  const gapCurrent = data.gap_percentage;

  let highestCompare = null;
  let dsCountCompare = 0;
  let tpCountCompare = 0;
  if (hasComparison && compareRanking) {
    const compareHighest = compareRanking.reduce(
      (max, item) => (item.yield > max.yield ? item : max),
      { yield: 0, method: '', count: 0 }
    );
    if (compareHighest.yield > 0) {
      highestCompare = {
        value: compareHighest.yield,
        method: compareHighest.method === 'direct-seeded' ? 'direct-seeded' : 'transplanted',
      };
    }
    const dsCompare = compareRanking.find(m => m.method === 'direct-seeded');
    const tpCompare = compareRanking.find(m => m.method === 'transplanted');
    dsCountCompare = dsCompare?.count ?? 0;
    tpCountCompare = tpCompare?.count ?? 0;
  }

  const stats = hasComparison
    ? comparisonStats || {
      currentAvg: data.average_yield,
      // @ts-ignore
      compareAvg: compareData.reduce((sum, item) => sum + (item.compare || 0), 0) / compareData.length,
      diffPercent: "0",
      higher: true,
    }
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {hasComparison ? (
          <>
            <StatCardComparison
              title="Average Yield"
              subtitle="Overall average"
              currentValue={stats.currentAvg}
              currentUnit="t/ha"
              compareValue={stats.compareAvg}
              compareUnit="t/ha"
              currentLabel={currentSeasonLabel!}
              compareLabel={compareSeasonLabel!}
            />
            <StatCardComparison
              title="Highest Yield"
              subtitle="Method with highest yield"
              currentValue={highestCurrent ? highestCurrent.value : 0}
              currentUnit="t/ha"
              currentMeta={highestCurrent?.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted'}
              compareValue={highestCompare?.value ?? 0}
              compareUnit="t/ha"
              compareMeta={highestCompare?.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted'}
              currentLabel={currentSeasonLabel!}
              compareLabel={compareSeasonLabel!}
            />
            <StatCardComparison
              title="Direct Seeded"
              subtitle="Number of records"
              currentValue={dsCountCurrent}
              currentUnit=""
              compareValue={dsCountCompare}
              compareUnit=""
              currentLabel={currentSeasonLabel!}
              compareLabel={compareSeasonLabel!}
            />
            <StatCardComparison
              title="Transplanted"
              subtitle="Number of records"
              currentValue={tpCountCurrent}
              currentUnit=""
              compareValue={tpCountCompare}
              compareUnit=""
              currentLabel={currentSeasonLabel!}
              compareLabel={compareSeasonLabel!}
            />
          </>
        ) : (
          <>
            <StatCardMinimal
              title="Highest Yield"
              subtitle={highestCurrent ? (highestCurrent.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted') : 'N/A'}
              current_value={highestCurrent ? Number(highestCurrent.value.toFixed(2)) : 0}
              unit="t/ha"
            />
            <StatCardMinimal
              title="Direct Seeded"
              subtitle={`${dsCountCurrent} record${dsCountCurrent !== 1 ? 's' : ''}`}
              current_value={dsCountCurrent}
              unit=""
            />
            <StatCardMinimal
              title="Transplanted"
              subtitle={`${tpCountCurrent} record${tpCountCurrent !== 1 ? 's' : ''}`}
              current_value={tpCountCurrent}
              unit=""
            />
            <StatCardMinimal
              title="Yield Gap"
              subtitle="High vs Low difference"
              current_value={Number(gapCurrent.toFixed(1))}
              unit="%"
            />
          </>
        )}
      </div>

      <GroupedBarChart
        data={chartData}
        header={{
          title: "Yield by Method",
          description: hasComparison ? `${currentSeasonLabel} vs ${compareSeasonLabel}` : "Current Season",
        }}
        categoryKey="method"
        barKeys={barKeys}
        valueUnit="t/ha"
      />

      {data.ranking.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>
            {hasComparison ? (
              stats ? (
                <>
                  {stats.higher
                    ? `${currentSeasonLabel}'s average yield (${stats.currentAvg.toFixed(2)} t/ha) is ${stats.diffPercent}% higher than ${compareSeasonLabel}'s (${stats.compareAvg.toFixed(2)} t/ha).`
                    : `${currentSeasonLabel}'s average yield (${stats.currentAvg.toFixed(2)} t/ha) is ${stats.diffPercent}% lower than ${compareSeasonLabel}'s (${stats.compareAvg.toFixed(2)} t/ha).`}
                  {highestCurrent && highestCompare && (
                    <> The highest yield in {currentSeasonLabel} is ${highestCurrent.value.toFixed(2)} t/ha (${highestCurrent.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted'}), while in {compareSeasonLabel} it is ${highestCompare.value.toFixed(2)} t/ha (${highestCompare.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted'}).</>
                  )}
                </>
              ) : null
            ) : (
              (() => {
                const methodsWithData = data.ranking.filter(item => item.yield > 0);
                if (methodsWithData.length === 0) return <>No yield data available for any method.</>;
                if (methodsWithData.length === 1) {
                  const method = methodsWithData[0];
                  return (
                    <>
                      Only <span className="font-medium text-foreground">
                        {method.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted'}
                      </span>{' '}
                      is used, with an average yield of{' '}
                      <span className="font-medium text-foreground">{method.yield.toFixed(2)} t/ha</span>.
                    </>
                  );
                }
                const highest = data.highest_method!;
                const lowest = data.lowest_method!;
                const gap = data.gap_percentage;
                if (highest.value === lowest.value) {
                  return (
                    <>
                      Both methods have equal average yields of{' '}
                      <span className="font-medium text-foreground">{highest.value.toFixed(2)} t/ha</span>.
                    </>
                  );
                }
                return (
                  <>
                    <span className="font-medium text-foreground">
                      {highest.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted'}
                    </span>{' '}
                    leads with{' '}
                    <span className="font-medium text-foreground">{highest.value.toFixed(2)} t/ha</span>{' '}
                    average yield, outperforming{' '}
                    <span className="font-medium text-foreground">
                      {lowest.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted'}
                    </span>{' '}
                    by{' '}
                    <span className="font-medium text-foreground">{gap.toFixed(1)}%</span>.
                  </>
                );
              })()
            )}
            {!hasComparison && <> The overall average yield is <span className="font-medium text-foreground">{data.average_yield.toFixed(2)} t/ha</span>.</>}
          </p>
        </div>
      )}
    </div>
  );
}
