// @ts-nocheck

import { Lightbulb } from 'lucide-react';
import { YieldVarietyData } from '@/features/analytics/schemas/comparative/yield-variety';
import { useMemo } from 'react';
import { GroupedBarChart } from '@/features/analytics/components/GroupedBarChart/GroupedBarChart';
import { StatCardComparison, StatCardMinimal } from '@/features/analytics/components/StatCard';

export function YieldByVarietyView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabel,
  comparisonStats,
}: {
  data: YieldVarietyData;
  compareData?: any;
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

  if (!hasComparison) {
    const chartData = data.ranking.map(item => ({
      variety: item.variety,
      current: Number(item.yield.toFixed(2)),
    }));

    const barKeys = [
      { key: "current", name: currentSeasonLabel ?? "Yield (t/ha)", color: "var(--color-humay)" },
    ];

    const insightContent = useMemo(() => {
      const varietiesWithData = data.ranking.filter(item => item.yield > 0);
      if (varietiesWithData.length === 0) return "No yield data available for any variety.";
      if (varietiesWithData.length === 1) {
        const v = varietiesWithData[0];
        return `Only ${v.variety} has data, with average yield ${v.yield.toFixed(2)} t/ha.`;
      }
      const highest = varietiesWithData.reduce((max, v) => v.yield > max.yield ? v : max);
      const lowest = varietiesWithData.reduce((min, v) => v.yield < min.yield ? v : min);
      const gap = ((highest.yield - lowest.yield) / highest.yield) * 100;
      return (
        <>
          <span className="font-medium text-foreground">{highest.variety}</span> leads with{' '}
          <span className="font-medium text-foreground">{highest.yield.toFixed(2)} t/ha</span> average yield,
          outperforming{' '}
          <span className="font-medium text-foreground">{lowest.variety}</span> by{' '}
          <span className="font-medium text-foreground">{gap.toFixed(1)}%</span>.
        </>
      );
    }, [data]);

    return (
      <div className="flex flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatCardMinimal
            title="Average Yield"
            subtitle="Overall average"
            current_value={Number(data.average_yield.toFixed(2))}
            unit="t/ha"
          />
          <StatCardMinimal
            title="Highest Yield"
            subtitle={data.highest_variety?.variety ?? 'N/A'}
            current_value={data.highest_variety?.value ? Number(data.highest_variety.value.toFixed(2)) : 0}
            unit="t/ha"
          />
        </div>

        <GroupedBarChart
          data={chartData}
          header={{
            title: "Yield by Variety",
            description: currentSeasonLabel ?? "Current Season",
          }}
          categoryKey="variety"
          barKeys={barKeys}
          valueUnit="t/ha"
          cardClass="min-h-120"
        />

        {insightContent && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground pt-2">
            <Lightbulb className="size-4 mt-0.5 shrink-0" />
            <p>{insightContent}</p>
          </div>
        )}
      </div>
    );
  }

  const barKeys = [
    { key: "current", name: currentSeasonLabel!, color: "var(--color-humay)" },
    { key: "compare", name: compareSeasonLabel!, color: "var(--color-humay-light)" },
  ];

  const currentHighest = data.ranking.reduce((max, item) => item.yield > max.yield ? item : max, { yield: 0, variety: '' });
  const compareHighest = compareData.reduce(
    (max, item) => item.compare > max.compare ? { compare: item.compare, variety: item.variety } : max,
    { compare: 0, variety: '' }
  );
  const stats = comparisonStats || {
    currentAvg: data.average_yield,
    compareAvg: compareData.reduce((sum, item) => sum + (item.compare || 0), 0) / compareData.length,
    diffPercent: "0",
    higher: true,
  };

  console.log('compareData:', compareData);
  console.log('compareHighest:', compareHighest);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
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
          subtitle="Variety"
          currentValue={currentHighest.yield}
          currentUnit="t/ha"
          compareValue={compareHighest.compare}
          compareUnit="t/ha"
          currentLabel={currentSeasonLabel!}
          compareLabel={compareSeasonLabel!}
        />
      </div>

      <GroupedBarChart
        data={compareData}
        header={{
          title: "Yield by Variety",
          description: `${currentSeasonLabel} vs ${compareSeasonLabel}`,
        }}
        categoryKey="variety"
        barKeys={barKeys}
        valueUnit="t/ha"
        cardClass="min-h-120"
      />

      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
        <Lightbulb className="size-4 mt-0.5 shrink-0" />
        <p>
          {stats.higher
            ? `${currentSeasonLabel}'s average yield (${stats.currentAvg.toFixed(2)} t/ha) is ${stats.diffPercent}% higher than ${compareSeasonLabel}'s (${stats.compareAvg.toFixed(2)} t/ha).`
            : `${currentSeasonLabel}'s average yield (${stats.currentAvg.toFixed(2)} t/ha) is ${stats.diffPercent}% lower than ${compareSeasonLabel}'s (${stats.compareAvg.toFixed(2)} t/ha).`}
          {currentHighest.yield > 0 && compareHighest.yield > 0 && (
            <> The highest yielding variety in {currentSeasonLabel} is {currentHighest.variety} with {currentHighest.yield.toFixed(2)} t/ha, while in {compareSeasonLabel} it is {compareHighest.variety} with {compareHighest.yield.toFixed(2)} t/ha.</>
          )}
        </p>
      </div>
    </div>
  );
}
