
import { DamageByLocationData } from '../schemas/comparative/damage-location';
import { StatCardComparison, StatCardMinimal } from '../components/StatCard';
import { GroupedBarChart } from '../components/GroupedBarChart/GroupedBarChart';
import { Lightbulb } from 'lucide-react';
import { buildBarKeys, normaliseCompareProps } from '../utils';

function buildGroupedRows(
  primaryRanking: { location: string; total_affected_area: number }[],
  cmpDataItems: any[]
): Record<string, any>[] {
  const rowMap = new Map<string, Record<string, any>>();
  for (const item of primaryRanking) {
    rowMap.set(item.location, { location: item.location, current: Number(item.total_affected_area.toFixed(2)) });
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

export function DamageByLocationView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabels,
  compareSeasonLabel,
  comparisonStats,
}: {
  data: DamageByLocationData;
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
    : data.ranking.map(item => ({ location: item.location, current: Number(item.total_affected_area.toFixed(2)) }));

  const barKeys = buildBarKeys(currentLabel, hasComparison ? cmpLabels : []);

  const totalReports      = data.total_damage_reports;
  const totalArea         = data.total_affected_area_ha;
  const locationsWithData = data.ranking.length;
  const avgArea           = locationsWithData > 0 ? totalArea / locationsWithData : 0;
  const currentHighest    = data.highest_affected_area;

  const insightText = hasComparison && primaryStats
    ? buildInsight(currentLabel, primaryStats.totalArea ?? totalArea, cmpLabels, compareStatsList)
    : null;

  const STAT_METRICS = [
    { key: "totalReports",    title: "Total Reports",           subtitle: "All damage incidents",    unit: "reports" },
    { key: "totalArea",       title: "Total Affected Area",     subtitle: "Sum of affected area",    unit: "ha" },
    { key: "locationsCount",  title: "Affected Locations",      subtitle: "Locations with damage",   unit: "locations" },
    { key: "avgArea",         title: "Avg Area per Location",   subtitle: "Mean affected area",      unit: "ha" },
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
            <StatCardMinimal title="Total Reports"         subtitle="All damage incidents"  current_value={totalReports}                   unit="reports" />
            <StatCardMinimal title="Total Affected Area"   subtitle="Sum of affected area"  current_value={Number(totalArea.toFixed(2))}    unit="ha" />
            <StatCardMinimal title="Affected Locations"    subtitle="Locations with damage" current_value={locationsWithData}               unit="locations" />
            <StatCardMinimal title="Avg Area per Location" subtitle="Mean affected area"    current_value={Number(avgArea.toFixed(2))}      unit="ha" />
          </>
        )}
      </div>

      <GroupedBarChart
        data={groupedRows}
        header={{
          title: "Damage by Location",
          description: hasComparison
            ? `${currentLabel} vs ${cmpLabels.join(', ')}`
            : "Affected area per location",
        }}
        categoryKey="location"
        barKeys={barKeys}
        valueUnit="ha"
        cardClass="min-h-120"
      />

      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
        <Lightbulb className="size-4 mt-0.5 shrink-0" />
        <p>
          {insightText ?? (
            locationsWithData === 1 ? (
              <>
                Only <span className="font-medium text-foreground">{data.ranking[0].location}</span> has damage,
                with <span className="font-medium text-foreground">{totalReports} report{totalReports !== 1 ? 's' : ''}</span>{' '}
                affecting <span className="font-medium text-foreground">{totalArea.toFixed(2)} ha</span>.
              </>
            ) : (
              <>
                Damage spread across <span className="font-medium text-foreground">{locationsWithData}</span> locations.
                On average, each location has <span className="font-medium text-foreground">{avgArea.toFixed(2)} ha</span> affected.{' '}
                The most affected area is{' '}
                <span className="font-medium text-foreground">{currentHighest?.location}</span>{' '}
                ({currentHighest?.value.toFixed(2)} ha).
              </>
            )
          )}
        </p>
      </div>
    </div>
  );
}
