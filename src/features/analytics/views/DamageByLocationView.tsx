import { DamageByLocationData } from '../schemas/comparative/damage-location';
import { StatCardComparison, StatCardMinimal } from '../components/StatCard';
import { GroupedBarChart } from '../components/GroupedBarChart/GroupedBarChart';
import { Lightbulb } from 'lucide-react';

export function DamageByLocationView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabel,
  comparisonStats,
}: {
  data: DamageByLocationData;
  compareData?: any;
  currentSeasonLabel?: string | null;
  compareSeasonLabel?: string | null;
  comparisonStats?: {
    current: { totalReports: number; totalArea: number; locationsCount: number; avgArea: number };
    compare: { totalReports: number; totalArea: number; locationsCount: number; avgArea: number };
  };
}) {
  const hasComparison = !!compareData?.length && currentSeasonLabel && compareSeasonLabel;
  const isComparisonEmpty = hasComparison && compareData.every((item: any) => item.compare === 0);

  // Build chart data and bar keys based on mode
  const chartData = hasComparison
    ? compareData // already in { location, current, compare }
    : data.ranking.map(item => ({
        location: item.location,
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
  const locationsWithData = data.ranking.length;
  const avgArea = locationsWithData > 0 ? totalArea / locationsWithData : 0;

  const currentHighest = data.highest_affected_area;
  const compareHighest = hasComparison && compareData
  // @ts-ignore
    ? compareData.reduce((max, item) => item.compare > max.value ? { location: item.location, value: item.compare } : max, { location: '', value: 0 })
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
              title="Affected Locations"
              subtitle="Locations with damage"
              currentValue={statsCurrent.locationsCount}
              currentUnit="locations"
              compareValue={statsCompare.locationsCount}
              compareUnit="locations"
              currentLabel={currentSeasonLabel!}
              compareLabel={compareSeasonLabel!}
            />
            <StatCardComparison
              title="Avg Area per Location"
              subtitle="Mean affected area"
              currentValue={statsCurrent.avgArea}
              currentUnit="ha"
              compareValue={statsCompare.avgArea}
              compareUnit="ha"
              currentLabel={currentSeasonLabel!}
              compareLabel={compareSeasonLabel!}
            />
          </>
        ) : (
          <>
            <StatCardMinimal title="Total Reports" subtitle="All damage incidents" current_value={totalReports} unit="reports" />
            <StatCardMinimal title="Total Affected Area" subtitle="Sum of affected area" current_value={Number(totalArea.toFixed(2))} unit="ha" />
            <StatCardMinimal title="Affected Locations" subtitle="Locations with damage" current_value={locationsWithData} unit="locations" />
            <StatCardMinimal title="Avg Area per Location" subtitle="Mean affected area" current_value={Number(avgArea.toFixed(2))} unit="ha" />
          </>
        )}
      </div>

      <GroupedBarChart
        data={chartData}
        header={{
          title: "Damage by Location",
          description: hasComparison ? `${currentSeasonLabel} vs ${compareSeasonLabel}` : "Affected area per location",
        }}
        categoryKey="location"
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
                ? `${currentSeasonLabel}'s total affected area (${statsCurrent.totalArea.toFixed(2)} ha) is ${((statsCurrent.totalArea - statsCompare.totalArea) / statsCompare.totalArea * 100).toFixed(1)}% higher than ${compareSeasonLabel}'s (${statsCompare.totalArea.toFixed(2)} ha).`
                : `${currentSeasonLabel}'s total affected area (${statsCurrent.totalArea.toFixed(2)} ha) is ${((statsCompare.totalArea - statsCurrent.totalArea) / statsCompare.totalArea * 100).toFixed(1)}% lower than ${compareSeasonLabel}'s (${statsCompare.totalArea.toFixed(2)} ha).`}
              {currentHighest && compareHighest && compareHighest.value > 0 && (
                <> The largest affected area in {currentSeasonLabel} is {currentHighest.location} with {currentHighest.value.toFixed(2)} ha, while in {compareSeasonLabel} it is {compareHighest.location} with {compareHighest.value.toFixed(2)} ha.</>
              )}
            </>
          ) : (
            <>
              {locationsWithData === 1 ? (
                <>
                  Only <span className="font-medium text-foreground">{data.ranking[0].location}</span> has damage,
                  with <span className="font-medium text-foreground">{totalReports} report{totalReports !== 1 ? 's' : ''}</span>{' '}
                  affecting <span className="font-medium text-foreground">{totalArea.toFixed(2)} ha</span>.
                </>
              ) : (
                <>
                  Damage spread across <span className="font-medium text-foreground">{locationsWithData}</span> locations.
                  On average, each location has <span className="font-medium text-foreground">{avgArea.toFixed(2)} ha</span> affected.
                  The location with most reports is{' '}
                  <span className="font-medium text-foreground">{data.highest_damage_count?.location}</span> ({data.highest_damage_count?.value} reports),
                  while the largest affected area is{' '}
                  <span className="font-medium text-foreground">{currentHighest?.location}</span> ({currentHighest?.value.toFixed(2)} ha).
                </>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
