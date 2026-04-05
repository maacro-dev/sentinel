import { DamageByCauseData } from '../schemas/comparative/damage-cause';
import { StatCardComparison, StatCardMinimal } from '../components/StatCard';
import { GroupedBarChart } from '../components/GroupedBarChart/GroupedBarChart';
import { Lightbulb } from 'lucide-react';

export function DamageByCauseView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabel,
  comparisonStats,
}: {
  data: DamageByCauseData;
  compareData?: any;
  currentSeasonLabel?: string | null;
  compareSeasonLabel?: string | null;
  comparisonStats?: {
    current: { totalReports: number; totalArea: number; causesCount: number; avgArea: number };
    compare: { totalReports: number; totalArea: number; causesCount: number; avgArea: number };
    diffPercent: string;
    higher: boolean;
  };
}) {
  const hasComparison = !!compareData?.length && currentSeasonLabel && compareSeasonLabel;
  const isComparisonEmpty = hasComparison && compareData.every((item: any) => item.compare === 0);

  const chartData = hasComparison
    ? compareData
    : data.ranking.map(item => ({
        cause: item.cause,
        current: Number(item.total_affected_area.toFixed(2)),
      }));

  const barKeys = hasComparison
    ? [
        { key: "current", name: currentSeasonLabel!, color: "var(--color-humay)" },
        { key: "compare", name: compareSeasonLabel!, color: "var(--color-humay-light)" },
      ]
    : [
        { key: "current", name: currentSeasonLabel ?? "Affected Area (ha)", color: "var(--color-humay)" },
      ];

  const statsCurrent = hasComparison ? comparisonStats?.current : null;
  const statsCompare = hasComparison ? comparisonStats?.compare : null;

  const totalReports = data.total_damage_reports;
  const totalArea = data.total_affected_area_ha;
  const highestCount = data.highest_damage_count;
  const highestArea = data.highest_affected_area;
  const causeCount = data.ranking.length;

  const currentHighest = highestArea;

  const compareHighest = hasComparison && compareData
  // @ts-ignore
    ? compareData.reduce((max, item) => item.compare > max.value ? { cause: item.cause, value: item.compare } : max, { cause: '', value: 0 })
    : null;

  return (
    <div className="flex flex-col gap-4">
      {isComparisonEmpty && (
        <div className="w-full py-2 rounded-container px-3 border text-xs font-medium bg-amber-100 border-amber-600 text-amber-600">
          No damage records found for the comparison season ({compareSeasonLabel}). Showing only current season data.
        </div>
      )}

      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {hasComparison && statsCurrent && statsCompare ? (
          <>
            <StatCardComparison
              title="Total Reports"
              subtitle="All damage incidents"
              currentValue={statsCurrent.totalReports}
              currentUnit="reports"
              compareValue={statsCompare.totalReports}
              compareUnit="reports"
              currentLabel={currentSeasonLabel!}
              compareLabel={compareSeasonLabel!}
            />
            <StatCardComparison
              title="Total Affected Area"
              subtitle="Sum of affected area"
              currentValue={statsCurrent.totalArea}
              currentUnit="ha"
              compareValue={statsCompare.totalArea}
              compareUnit="ha"
              currentLabel={currentSeasonLabel!}
              compareLabel={compareSeasonLabel!}
            />
            <StatCardComparison
              title="Most Frequent Cause"
              subtitle="Top cause"
              currentValue={highestCount?.value ?? 0}
              currentUnit="reports"
              compareValue={0}
              compareUnit="reports"
              currentLabel={currentSeasonLabel!}
              compareLabel={compareSeasonLabel!}
            />
            <StatCardComparison
              title="Largest Area Cause"
              subtitle="Worst cause"
              currentValue={currentHighest?.value ?? 0}
              currentUnit="ha"
              compareValue={compareHighest?.value ?? 0}
              compareUnit="ha"
              currentLabel={currentSeasonLabel!}
              compareLabel={compareSeasonLabel!}
            />
          </>
        ) : (
          <>
            <StatCardMinimal title="Total Reports" subtitle="All damage incidents" current_value={totalReports} unit="reports" />
            <StatCardMinimal title="Total Affected Area" subtitle="Sum of affected area" current_value={Number(totalArea.toFixed(2))} unit="ha" />
            <StatCardMinimal title="Most Frequent Cause" subtitle={highestCount?.cause ?? 'N/A'} current_value={highestCount?.value ?? 0} unit="reports" />
            <StatCardMinimal title="Largest Area Cause" subtitle={highestArea?.cause ?? 'N/A'} current_value={highestArea ? Number(highestArea.value.toFixed(2)) : 0} unit="ha" />
          </>
        )}
      </div>

      <GroupedBarChart
        data={chartData}
        header={{
          title: "Damage by Cause",
          description: hasComparison ? `${currentSeasonLabel} vs ${compareSeasonLabel}` : "Affected area per cause",
        }}
        categoryKey="cause"
        barKeys={barKeys}
        valueUnit="ha"
        cardClass="min-h-120"
      />

      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
        <Lightbulb className="size-4 mt-0.5 shrink-0" />
        <p>
          {hasComparison && statsCurrent && statsCompare ? (
            <>
              {statsCurrent.totalArea > statsCompare.totalArea
                ? `${currentSeasonLabel}'s total affected area (${statsCurrent.totalArea.toFixed(2)} ha) is ${statsCurrent.totalArea > 0 ? ((statsCurrent.totalArea - statsCompare.totalArea) / statsCompare.totalArea * 100).toFixed(1) : '0'}% higher than ${compareSeasonLabel}'s (${statsCompare.totalArea.toFixed(2)} ha).`
                : `${currentSeasonLabel}'s total affected area (${statsCurrent.totalArea.toFixed(2)} ha) is ${statsCompare.totalArea > 0 ? ((statsCompare.totalArea - statsCurrent.totalArea) / statsCompare.totalArea * 100).toFixed(1) : '0'}% lower than ${compareSeasonLabel}'s (${statsCompare.totalArea.toFixed(2)} ha).`}
              {currentHighest && compareHighest && compareHighest.value > 0 && (
                <> The most damaging cause in {currentSeasonLabel} is {currentHighest.cause} with {currentHighest.value.toFixed(2)} ha, while in {compareSeasonLabel} it is {compareHighest.cause} with {compareHighest.value.toFixed(2)} ha.</>
              )}
            </>
          ) : (
            <>
              {causeCount === 1 ? (
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
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
