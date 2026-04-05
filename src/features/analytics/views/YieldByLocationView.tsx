import { ChartConfig } from '@/core/components/ui/chart';
import { YieldByLocationData } from '@/features/analytics/schemas/comparative/yield-location';
import { StatCardComparison, StatCardMinimal } from '../components/StatCard';
import { Lightbulb } from 'lucide-react';
import { GroupedBarChart } from '../components/GroupedBarChart/GroupedBarChart';

export const yieldByLocationChartConfig = {
  yield: {
    label: "Yield (t/ha)"
  }
} satisfies ChartConfig;

const computeComparisonInsight = (groupedData: any[], currentLabel: string, compareLabel: string, stats: any) => {
  if (!groupedData.length) return null;
  const currentAvg = stats.primary.avg;
  const compareAvg = stats.compare.avg;
  const diffPercent = ((currentAvg - compareAvg) / compareAvg) * 100;
  const higher = currentAvg > compareAvg;
  const absDiff = Math.abs(diffPercent).toFixed(1);
  return {
    currentAvg: currentAvg.toFixed(2),
    compareAvg: compareAvg.toFixed(2),
    diffPercent: absDiff,
    higher,
    text: `${currentLabel}'s average yield (${currentAvg.toFixed(2)} t/ha) is ${absDiff}% ${higher ? 'higher' : 'lower'} than ${compareLabel}'s average (${compareAvg.toFixed(2)} t/ha).${higher ? ' This indicates improved performance.' : ' This suggests a decline in productivity.'}`
  };
};

export function YieldByLocationView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabel,
  comparisonStats,
}: {
  data: YieldByLocationData;
  level?: 'province' | 'municipality' | 'barangay';
  compareData?: any;
  currentSeasonLabel: string | null;
  compareSeasonLabel: string | null;
  comparisonStats?: any;
}) {
  const hasComparison = !!compareData?.length && currentSeasonLabel && compareSeasonLabel;

  const roundedRanking = data.ranking.map(item => ({
    ...item,
    yield: Number(item.yield.toFixed(2))
  }));

  const singleSeasonData = data.ranking.map(item => ({
    location: item.location,
    current: item.yield,
  }));

  const groupedData = hasComparison ? compareData : singleSeasonData;

  const barKeys = hasComparison
    ? [
        { key: "current", name: currentSeasonLabel ?? "Current Season", color: "var(--color-humay)" },
        { key: "compare", name: compareSeasonLabel ?? "Comparison Season", color: "var(--color-humay-light)" },
      ]
    : [
        { key: "current", name: currentSeasonLabel ?? "Yield (t/ha)", color: "var(--color-humay)" },
      ];

  const highest = data.highest_yield;
  const lowest = data.lowest_yield;
  const gap = data.gap_percentage;
  const avg = data.average_yield;
  const locationsWithData = roundedRanking.filter(item => item.yield > 0).length;

  // Use stats from hook
  const primaryStats = hasComparison ? comparisonStats?.primary : null;
  const compareStats = hasComparison ? comparisonStats?.compare : null;

  const comparisonInsight = hasComparison && currentSeasonLabel && compareSeasonLabel && comparisonStats
    ? computeComparisonInsight(compareData, currentSeasonLabel, compareSeasonLabel, comparisonStats)
    : null;

  return (
    <div className='flex flex-col gap-4'>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {hasComparison && primaryStats && compareStats ? (
          <>
            <StatCardComparison
              title="Average Yield (Provincial Mean)"
              subtitle="Computed from province-level averages"
              currentValue={primaryStats.avg}
              currentUnit="t/ha"
              compareValue={compareStats.avg}
              compareUnit="t/ha"
              currentLabel={currentSeasonLabel ?? "Current"}
              compareLabel={compareSeasonLabel ?? "Comparison"}
            />
            <StatCardComparison
              title="Highest Yield"
              subtitle={primaryStats.highestLocation ?? "Location"}
              currentValue={primaryStats.highest}
              currentUnit="t/ha"
              compareValue={compareStats.highest}
              compareUnit="t/ha"
              currentLabel={currentSeasonLabel ?? "Current"}
              compareLabel={compareSeasonLabel ?? "Comparison"}
            />
            <StatCardComparison
              title="Lowest Yield"
              subtitle={primaryStats.lowestLocation ?? "Location"}
              currentValue={primaryStats.lowest}
              currentUnit="t/ha"
              compareValue={compareStats.lowest}
              compareUnit="t/ha"
              currentLabel={currentSeasonLabel ?? "Current"}
              compareLabel={compareSeasonLabel ?? "Comparison"}
            />
            <StatCardComparison
              title="Yield Gap"
              subtitle="High vs Low difference"
              currentValue={primaryStats.gap}
              currentUnit="%"
              compareValue={compareStats.gap}
              compareUnit="%"
              currentLabel={currentSeasonLabel ?? "Current"}
              compareLabel={compareSeasonLabel ?? "Comparison"}
            />
          </>
        ) : (
          <>
            <StatCardMinimal
              title='Average Yield (Provincial Mean)'
              subtitle='Computed from province-level averages'
              current_value={Number(avg.toFixed(2))}
              unit='t/ha'
            />
            <StatCardMinimal
              title='Highest Yield'
              subtitle={highest?.location ?? 'N/A'}
              current_value={highest ? Number(highest.value.toFixed(2)) : 0}
              unit='t/ha'
            />
            <StatCardMinimal
              title='Lowest Yield'
              subtitle={lowest?.location ?? 'N/A'}
              current_value={lowest ? Number(lowest.value.toFixed(2)) : 0}
              unit='t/ha'
            />
            <StatCardMinimal
              title='Yield Gap'
              subtitle="High vs Low difference"
              current_value={Number(gap.toFixed(1))}
              unit='%'
            />
          </>
        )}
      </div>
      <GroupedBarChart
        data={groupedData}
        header={{
          title: "Yield by Location",
          description: hasComparison ? `${currentSeasonLabel ?? 'Current'} vs ${compareSeasonLabel ?? 'Comparison'}` : "Current Season"
        }}
        categoryKey="location"
        barKeys={barKeys}
        valueUnit='t/ha'
      />
      {data.ranking.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>
            {comparisonInsight ? (
              comparisonInsight.text
            ) : (
              highest ? (
                <>
                  <span className="font-medium text-foreground">{highest.location}</span> leads with{' '}
                  <span className="font-medium text-foreground">{highest.value.toFixed(2)} t/ha</span> average yield,
                  outperforming{' '}
                  <span className="font-medium text-foreground">{lowest?.location ?? 'the lowest'}</span> by{' '}
                  <span className="font-medium text-foreground">{gap.toFixed(1)}%</span>.
                  The overall average across{' '} <span className="font-medium text-foreground">{locationsWithData}</span>{' '}
                  {locationsWithData === 1 ? 'location' : 'locations'} with data is{' '}
                  <span className="font-medium text-foreground">{avg.toFixed(2)} t/ha</span>.
                </>
              ) : (
                <>No yield data available for the selected filters.</>
              )
            )}
          </p>
        </div>
      )}
    </div>
  );
}
