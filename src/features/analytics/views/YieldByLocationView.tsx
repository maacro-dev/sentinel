import { YieldByLocationData } from '@/features/analytics/schemas/comparative/yield-location';
import { StatCardSparkline } from '../components/StatCard';
import { buildLineRows, generateShades, HUMAY_BASE, normaliseCompareProps } from '../utils';
import { MultiLineChart } from '../components/MultiLineChart';
import { useCallback, useMemo } from 'react';
import { ComparisonPieChart } from '../components/ComparisonPieChart';
import { cn } from '@/core/utils/style';
import { useTrendData } from '../hooks/useTrendData';

interface YieldByLocationViewProps {
  data: YieldByLocationData;
  compareData?: any[];
  currentSeasonLabel: string | null;
  compareSeasonLabels?: string[];
  compareSeasonLabel?: string | null;
  comparisonStats?: any[];
  onYieldLineHover?: (key: string) => void;
  onProvinceSelect?: (province: string) => void;
  onMunicipalitySelect?: (municipality: string) => void;
  onProvinceClear?: () => void;
  onMunicipalityClear?: () => void;
  level?: 'province' | 'municipality' | 'barangay';
  isLoading: boolean;
}



export function YieldByLocationView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabels,
  compareSeasonLabel,
  comparisonStats,
  onYieldLineHover,
  onProvinceSelect,
  onMunicipalitySelect,
  onProvinceClear,
  onMunicipalityClear,
  level = 'province',
  isLoading = false,
}: YieldByLocationViewProps) {
  const {
    cmpLabels,
    cmpDataItems,
    hasComparison,
    primaryStats,
    compareStatsList,
  } = normaliseCompareProps({ compareData, comparisonStats, compareSeasonLabels, compareSeasonLabel });

  const currentLabel = currentSeasonLabel ?? 'Current Season';
  const isAllSeasons = currentLabel === 'All Seasons';

  const { highest_yield: highest, lowest_yield: lowest, gap_percentage: gap, average_yield: avg } = data;

  const ranking = data.ranking;

  const { rows: lineRows, locationKeys, locationMap } = useMemo(
    () => buildLineRows(ranking, currentLabel, hasComparison ? cmpDataItems : [], hasComparison ? cmpLabels : [], !isAllSeasons, true),

    [ranking, currentLabel, hasComparison, cmpDataItems, cmpLabels, isAllSeasons],
  );

  const locationShades = useMemo(
    () => generateShades('oklch(62.7% 0.194 149.214)', locationKeys.length),
    [locationKeys.length],
  );

  const seasonColorMap = useMemo<Record<string, string>>(() => {
    const list: string[] = [];
    if (!isAllSeasons) list.push(currentLabel);
    list.push(...cmpLabels);
    const shades = generateShades(HUMAY_BASE, list.length);
    const map: Record<string, string> = {};
    list.forEach((season, i) => { map[season] = shades[i % shades.length]; });
    return map;
  }, [isAllSeasons, currentLabel, cmpLabels]);

  const pieDataByMetric = useMemo(() => {
    return Object.fromEntries(
      STAT_METRICS.map(({ key, unit }) => {
        const entries: { name: string; value: number; fill: string }[] = [];

        if (!isAllSeasons) {
          const entry = buildPieEntry(currentLabel, primaryStats, key, seasonColorMap[currentLabel]);
          if (entry) entries.push(entry);
        }

        compareStatsList.forEach((stats: any, i: number) => {
          const entry = buildPieEntry(cmpLabels[i], stats, key, seasonColorMap[cmpLabels[i]]);
          if (entry) entries.push(entry);
        });

        return [key, { data: entries, insight: buildInsight(entries, key, unit) }];
      }),
    );
  }, [isAllSeasons, currentLabel, primaryStats, compareStatsList, cmpLabels, seasonColorMap]);

  const handleLineClick = useCallback((key: string) => {
    const originalLocation = locationMap[key];
    if (!originalLocation) return;
    if (level === 'province') onProvinceSelect?.(originalLocation);
    else if (level === 'municipality') onMunicipalitySelect?.(originalLocation);
  }, [level, locationMap, onProvinceSelect, onMunicipalitySelect],);

  const handleFloatingClick = useCallback(() => {
    if (level === 'municipality') onProvinceClear?.();
    else if (level === 'barangay') onMunicipalityClear?.();
  }, [level, onProvinceClear, onMunicipalityClear]);

  const floatingLabel =
    level === 'municipality' ? 'Back to All Provinces' :
      level === 'barangay' ? 'Back to All Municipalities' : null;

  const chartKey = `${level}-${ranking}`;

  const trends = useTrendData(compareStatsList, cmpLabels, primaryStats, currentLabel, isAllSeasons, ['avg', 'highest', 'lowest', 'gap']);

  const statCards = (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <StatCardSparkline title="Overall Average Yield (Provincial Mean)" subtitle="Computed from province-level averages"
        value={Number(avg.toFixed(2))} unit="t/ha" trend={trends.avg} />
      <StatCardSparkline title="Overall Highest Yield" subtitle={highest?.location ?? 'N/A'}
        value={highest ? Number(highest.value.toFixed(2)) : 0} unit="t/ha" trend={trends.highest} />
      <StatCardSparkline title="Overall Lowest Yield" subtitle={lowest?.location ?? 'N/A'}
        value={lowest ? Number(lowest.value.toFixed(2)) : 0} unit="t/ha" trend={trends.lowest} />
      <StatCardSparkline title="Overall Yield Gap" subtitle="High vs Low difference"
        value={Number(gap.toFixed(1))} unit="%" trend={trends.gap} />
    </div>
  );

  return (
    <div className="relative flex flex-col gap-4">
      {(isAllSeasons || (!isAllSeasons && !hasComparison)) && statCards}

      {hasComparison && (
        <div className="grid auto-rows-min gap-4 grid-cols-4 transition-opacity duration-200">
          {STAT_METRICS.map(({ key, title, subtitle, unit }) => {
            const { data: pieData, insight } = pieDataByMetric[key];
            return (
              <ComparisonPieChart
                key={key}
                data={pieData}
                title={title}
                description={subtitle}
                valueUnit={unit}
                insight={insight}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      )}

      {!hasComparison ? (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground border rounded-md">
          Select seasons to compare to see the trend line
        </div>
      ) : (
        <div className="relative">
          <div
            className={cn(
              'absolute left-1/2 transform -translate-x-1/2 top-8 z-10 transition-all duration-300 ease-in-out',
              floatingLabel
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-2 pointer-events-none',
            )}
          >
            <button
              onClick={handleFloatingClick}
              className="bg-muted text-foreground px-4 py-2 rounded-full text-xs shadow-sm hover:bg-accent transition-colors cursor-pointer"
            >
              {floatingLabel}
            </button>
          </div>

          <MultiLineChart
            key={chartKey}
            data={lineRows}
            categoryKey="season"
            containerClass="h-120"
            lineKeys={locationKeys}
            colors={locationShades}
            valueUnit="t/ha"
            onLineClick={level !== 'barangay' ? (key, _event) => handleLineClick(key) : undefined}
            onLineHover={onYieldLineHover}
            isLoading={isLoading}
            header={{
              title: 'Yield by Location',
              description: hasComparison
                ? `${currentLabel} vs ${cmpLabels.join(', ')}`
                : 'Current Season',
            }}
          />
        </div>
      )}
    </div>
  );
}


const STAT_METRICS = [
  { key: 'avg', title: 'Average Yield (Provincial Mean)', subtitle: 'Mean across all provinces per season', unit: 't/ha' },
  { key: 'highest', title: 'Highest Yield Average', subtitle: 'Best performing location per season', unit: 't/ha' },
  { key: 'lowest', title: 'Lowest Yield Average', subtitle: 'Lowest performing location per season', unit: 't/ha' },
  { key: 'gap', title: 'Yield Gap', subtitle: 'Spread between highest and lowest per season', unit: '%' },
] as const;

type MetricKey = typeof STAT_METRICS[number]['key'];

function buildInsight(data: { name: string; value: number }[], metric: string, unit: string): string {
  if (data.length === 0) return '';
  if (data.length === 1) {
    return `${data[0].name} recorded ${data[0].value.toFixed(metric === 'gap' ? 1 : 2)} ${unit}.`;
  }
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = sorted[0];
  const min = sorted[sorted.length - 1];
  switch (metric) {
    case 'avg':
      return `${max.name} has the highest average yield at ${max.value.toFixed(2)} ${unit}, while ${min.name} is lowest at ${min.value.toFixed(2)} ${unit}.`;
    case 'highest':
      return `Peak yield was ${max.value.toFixed(2)} ${unit} in ${max.name}. ${min.name} had the lowest peak at ${min.value.toFixed(2)} ${unit}.`;
    case 'lowest':
      return `Worst yield was ${min.value.toFixed(2)} ${unit} in ${min.name}. ${max.name} had the best worst‑case at ${max.value.toFixed(2)} ${unit}.`;
    case 'gap':
      return `${max.name} shows the largest yield gap (${max.value.toFixed(1)}%), indicating more variability. ${min.name} is the most consistent (${min.value.toFixed(1)}%).`;
    default:
      return '';
  }
}


function buildPieEntry(
  label: string,
  stats: any,
  metric: MetricKey,
  fill: string,
): { name: string; value: number; fill: string } | null {
  const val = stats?.[metric];
  if (val == null) return null;
  const location =
    metric === 'highest' ? stats?.highestLocation :
      metric === 'lowest' ? stats?.lowestLocation : null;
  return {
    name: location ? `${label} (${location})` : label,
    value: val,
    fill,
  };
}
