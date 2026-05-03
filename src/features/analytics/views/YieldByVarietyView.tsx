import { memo, useMemo, useState, useCallback } from 'react';
import { StatCardMinimal, StatCardSparkline } from '../components/StatCard';
import { ComparisonPieChart } from '../components/ComparisonPieChart';
import { GroupedBarChart } from '../components/GroupedBarChart/GroupedBarChart';
import { Search } from 'lucide-react';
import { YieldByVarietyData } from '../schemas/comparative/yield-variety';
import { buildBarKeys, generateShades, HUMAY_BASE, normaliseCompareProps } from '../utils';
import { useTrendData } from '../hooks/useTrendData';
import { SortMode, VarietyLimit } from '../types';
import { VarietyToolbar } from './VarietyToolbar';
import { VARIETY_LIMIT_OPTIONS } from '../config';

const DEFAULT_LIMIT: VarietyLimit = 8;

const STAT_METRICS = [
  { key: 'avg', title: 'Average Yield', subtitle: 'Across all varieties', unit: 't/ha' },
  { key: 'highest', title: 'Best Variety', subtitle: '', unit: 't/ha' },
  { key: 'totalVarieties', title: 'Varieties Tracked', subtitle: 'With harvest data', unit: '' },
  { key: 'varietyGroup', title: 'Variety Group Dominance', subtitle: 'NSIC vs PSB vs Other', unit: '%' },
] as const;


function classifyVarietyGroup(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes('NSIC')) return 'NSIC';
  if (upper.includes('PSB')) return 'PSB';
  return 'Other';
}

function buildGroupedRows(
  primaryRanking: { variety: string; yield: number }[],
  cmpDataItems: any[],
  cmpLabels: string[],
): Record<string, any>[] {
  const rowMap = new Map<string, Record<string, any>>();

  for (const item of primaryRanking) {
    const row: Record<string, any> = { variety: item.variety, current: Number(item.yield.toFixed(2)) };
    rowMap.set(item.variety, row);
  }

  for (let i = 0; i < cmpDataItems.length; i++) {
    if (cmpLabels[i] === 'All Seasons') continue;
    const items = cmpDataItems[i];
    if (!Array.isArray(items)) continue;
    const key = `compare_${i}`;
    for (const item of items) {
      const v = item.variety as string;
      if (!rowMap.has(v)) continue;
      rowMap.get(v)![key] = Number((item.compare ?? 0).toFixed(2));
    }
  }

  const rows = Array.from(rowMap.values());
  for (const row of rows) {
    row._coverage = Object.entries(row)
      .filter(([k, v]) => k !== 'variety' && k !== '_coverage' && Number(v) > 0)
      .length;
  }
  return rows;
}

function buildPieEntry(
  label: string,
  stats: any,
  metric: string,
  fill: string,
): { name: string; value: number; fill: string } | null {
  const val = stats?.[metric];
  if (val == null) return null;
  const variety = metric === 'highest' ? stats?.highestVariety : null;
  return { name: variety ? `${label} (${variety})` : label, value: val, fill };
}

function buildPieInsight(
  data: { name: string; value: number }[],
  metric: string,
  unit: string,
): string {
  if (data.length === 0) return '';
  if (data.length === 1) {
    return `${data[0].name} recorded ${data[0].value.toFixed(metric === 'totalVarieties' ? 0 : 2)} ${unit}.`;
  }
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = sorted[0];
  const min = sorted[sorted.length - 1];
  switch (metric) {
    case 'avg':
      return `${max.name} has the highest average yield at ${max.value.toFixed(2)} ${unit}, while ${min.name} is lowest at ${min.value.toFixed(2)} ${unit}.`;
    case 'highest':
      return `Peak variety yield was ${max.value.toFixed(2)} ${unit} in ${max.name}. ${min.name} had the lowest peak at ${min.value.toFixed(2)} ${unit}.`;
    case 'totalVarieties':
      return `${max.name} tracked the most varieties (${max.value}), while ${min.name} tracked the fewest (${min.value}).`;
    case 'varietyGroup':
      return `${max.name} dominates with ${max.value.toFixed(1)}% of total yield. ${min.name} accounts for ${min.value.toFixed(1)}%.`;
    default:
      return '';
  }
}


const GROUP_COLORS = generateShades(HUMAY_BASE, 3);

function buildVarietyGroupAdoptionData(
  primaryRanking: { variety: string; yield: number }[],
  cmpDataItems: any[],
  isAllSeasons: boolean,
  currentLabel: string,
  cmpLabels: string[],
): { name: string; value: number; fill: string }[] {
  const groups = ['NSIC', 'PSB', 'Other'];
  const groupColors: Record<string, string> = {
    NSIC: GROUP_COLORS[0],
    PSB: GROUP_COLORS[1],
    Other: GROUP_COLORS[2],
  };

  const seasonShares: { label: string; shares: Record<string, number> }[] = [];

  const computeShares = (label: string, items: { variety: string; yield: number }[]) => {
    const totals: Record<string, number> = {};
    for (const g of groups) totals[g] = 0;
    let sum = 0;
    for (const item of items) {
      const g = classifyVarietyGroup(item.variety);
      totals[g] += item.yield;
      sum += item.yield;
    }
    const shares: Record<string, number> = {};
    if (sum > 0) {
      for (const g of groups) shares[g] = (totals[g] / sum) * 100;
    }
    return { label, shares };
  };

  if (!isAllSeasons) {
    seasonShares.push(computeShares(currentLabel, primaryRanking));
  }

  for (let i = 0; i < cmpDataItems.length; i++) {
    const items = cmpDataItems[i];
    if (!Array.isArray(items)) continue;
    if (cmpLabels[i] === 'All Seasons') continue;
    const ranking = items.map((item: any) => ({ variety: item.variety, yield: item.compare ?? 0 }));
    seasonShares.push(computeShares(cmpLabels[i], ranking));
  }

  const avgShares: Record<string, number> = { NSIC: 0, PSB: 0, Other: 0 };
  const count = seasonShares.length;
  if (count === 0) return [];

  for (const { shares } of seasonShares) {
    for (const g of groups) avgShares[g] += shares[g];
  }
  for (const g of groups) avgShares[g] /= count;

  const result: { name: string; value: number; fill: string }[] = [];
  for (const g of groups) {
    if (avgShares[g] > 0) {
      result.push({
        name: g,
        value: Number(avgShares[g].toFixed(1)),
        fill: groupColors[g],
      });
    }
  }
  return result;
}

interface YieldByVarietyViewProps {
  data: YieldByVarietyData;
  compareData?: any[];
  currentSeasonLabel?: string | null;
  compareSeasonLabels?: string[];
  compareSeasonLabel?: string | null;
  comparisonStats?: any[];
  isLoading?: boolean;
}

export const YieldByVarietyView = memo(function YieldByVarietyView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabels,
  compareSeasonLabel,
  comparisonStats,
  isLoading = false,
}: YieldByVarietyViewProps) {
  const { cmpLabels, cmpDataItems, hasComparison, primaryStats, compareStatsList } =
    normaliseCompareProps({ compareData, comparisonStats, compareSeasonLabels, compareSeasonLabel });

  const currentLabel = currentSeasonLabel ?? 'Current Season';
  const isAllSeasons = currentLabel === 'All Seasons';

  const avg = data.average_yield;
  const highestVariety = data.highest_variety;

  const [limit, setLimit] = useState<VarietyLimit>(DEFAULT_LIMIT);
  const [sortMode, setSortMode] = useState<SortMode>('yield_desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLimitChange = useCallback((v: VarietyLimit) => setLimit(v), []);
  const handleSortChange = useCallback((v: SortMode) => setSortMode(v), []);
  const handleSearchChange = useCallback((v: string) => setSearchQuery(v), []);

  const allGroupedRows: Record<string, any>[] = useMemo(() => {
    if (!hasComparison) {
      return data.ranking.map(item => ({
        variety: item.variety,
        current: Number(item.yield.toFixed(2)),
        _coverage: 1,
      })) as Record<string, any>[];
    }
    return buildGroupedRows(data.ranking, cmpDataItems, cmpLabels);
  }, [data.ranking, hasComparison, cmpDataItems, cmpLabels]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allGroupedRows;
    return allGroupedRows.filter(row =>
      String(row.variety).toLowerCase().includes(q)
    );
  }, [allGroupedRows, searchQuery]);

  const sortedRows = useMemo(() => {
    const copy = [...filteredRows];
    switch (sortMode) {
      case 'coverage_desc':
        return copy.sort((a, b) =>
          (b._coverage as number) - (a._coverage as number) ||
          ((b.current ?? 0) as number) - ((a.current ?? 0) as number)
        );
      case 'yield_desc':
        return copy.sort((a, b) => (b.current ?? 0) - (a.current ?? 0));
      case 'yield_asc':
        return copy.sort((a, b) => (a.current ?? 0) - (b.current ?? 0));
      case 'name_asc':
        return copy.sort((a, b) => String(a.variety).localeCompare(String(b.variety)));
      default:
        return copy;
    }
  }, [filteredRows, sortMode]);

  const topRows = useMemo(() => sortedRows.slice(0, limit), [sortedRows, limit]);

  const totalCount = allGroupedRows.length;
  const shownCount = topRows.length;
  const hiddenCount = filteredRows.length - topRows.length;
  const trimmedCount = totalCount - filteredRows.length;

  const barKeys = useMemo(() => {
    const filtered = hasComparison ? cmpLabels.filter(l => l !== 'All Seasons') : [];
    const keys = buildBarKeys(currentLabel, filtered);
    return isAllSeasons ? keys.filter(k => k.key !== 'current') : keys;
  }, [currentLabel, hasComparison, cmpLabels, isAllSeasons]);

  const seasonColorMap = useMemo<Record<string, string>>(() => {
    const list: string[] = [];
    if (!isAllSeasons) list.push(currentLabel);
    list.push(...cmpLabels);
    const shades = generateShades(HUMAY_BASE, list.length);
    const map: Record<string, string> = {};
    list.forEach((s, i) => { map[s] = shades[i % shades.length]; });
    return map;
  }, [isAllSeasons, currentLabel, cmpLabels]);

  // Pre‑compute group adoption data
  const groupAdoptionData = useMemo(
    () => buildVarietyGroupAdoptionData(data.ranking, cmpDataItems, isAllSeasons, currentLabel, cmpLabels),
    [data.ranking, cmpDataItems, isAllSeasons, currentLabel, cmpLabels],
  );

  const pieDataByMetric = useMemo(() =>
    Object.fromEntries(
      STAT_METRICS.map(({ key, unit }) => {
        if (key === 'varietyGroup') {
          return [key, {
            data: groupAdoptionData,
            insight: buildPieInsight(groupAdoptionData, key, unit),
          }];
        }
        const entries: { name: string; value: number; fill: string }[] = [];
        if (!isAllSeasons) {
          const entry = buildPieEntry(currentLabel, primaryStats, key, seasonColorMap[currentLabel]);
          if (entry) entries.push(entry);
        }
        compareStatsList.forEach((stats: any, i: number) => {
          const entry = buildPieEntry(cmpLabels[i], stats, key, seasonColorMap[cmpLabels[i]]);
          if (entry) entries.push(entry);
        });
        return [key, { data: entries, insight: buildPieInsight(entries, key, unit) }];
      }),
    ),
    [isAllSeasons, currentLabel, primaryStats, compareStatsList, cmpLabels, seasonColorMap, groupAdoptionData],
  );

  const trends = useTrendData(
    compareStatsList, cmpLabels, primaryStats, currentLabel, isAllSeasons,
    ['avg', 'highest', 'totalVarieties'],
  );

  const chartHeader = useMemo(() => ({
    title: 'Yield by Variety',
    description: hasComparison
      ? `${currentLabel} vs ${cmpLabels.join(', ')}`
      : (currentSeasonLabel ?? 'Current Season'),
  }), [hasComparison, currentLabel, cmpLabels, currentSeasonLabel]);

  const showChart = topRows.length > 0;
  const noSearchResults = searchQuery.trim().length > 0 && filteredRows.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {hasComparison && primaryStats ? (
        <div className="grid auto-rows-min gap-4 md:grid-cols-4 transition-opacity duration-200">
          {STAT_METRICS.map(({ key, title, subtitle, unit }) => {
            const { data: pieData, insight } = pieDataByMetric[key];
            // Use the subtitle from the metric definition
            const desc = key === 'highest'
              ? (primaryStats?.highestVariety ?? highestVariety?.variety ?? 'N/A')
              : subtitle;
            return (
              <ComparisonPieChart
                key={key}
                data={pieData}
                title={title}
                description={desc}
                valueUnit={unit}
                insight={insight}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      ) : isAllSeasons ? (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <StatCardSparkline
            title="Overall Average Yield" subtitle="Across all varieties and seasons"
            value={Number(avg.toFixed(2))} unit="t/ha" trend={trends.avg}
          />
          <StatCardSparkline
            title="Overall Highest Yield" subtitle={highestVariety?.variety ?? 'N/A'}
            value={highestVariety ? Number(highestVariety.value.toFixed(2)) : 0}
            unit="t/ha" trend={trends.highest}
          />
          <StatCardSparkline
            title="Total Varieties Tracked" subtitle="With harvest data"
            value={data.ranking.length} unit="" trend={trends.totalVarieties}
          />
        </div>
      ) : (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <StatCardMinimal
            title="Average Yield" subtitle="Overall average"
            current_value={Number(avg.toFixed(2))} unit="t/ha"
          />
          <StatCardMinimal
            title="Highest Yield" subtitle={highestVariety?.variety ?? 'N/A'}
            current_value={highestVariety ? Number(highestVariety.value.toFixed(2)) : 0}
            unit="t/ha"
          />
          <StatCardMinimal
            title="Varieties Tracked" subtitle="With harvest data"
            current_value={data.ranking.length} unit=""
          />
        </div>
      )}

      {data.ranking.length > 0 && (
        <VarietyToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          sortMode={sortMode}
          onSortChange={handleSortChange}
          limit={limit}
          onLimitChange={handleLimitChange}
          totalCount={totalCount}
          shownCount={shownCount}
        />
      )}

      {noSearchResults ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-sm text-muted-foreground border rounded-md">
          <Search className="size-5 opacity-40" />
          <span>No varieties match <span className="font-medium text-foreground">"{searchQuery}"</span></span>
        </div>
      ) : !showChart ? (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground border rounded-md">
          No variety data available.
        </div>
      ) : !hasComparison ? (
        <GroupedBarChart
          data={topRows}
          header={chartHeader}
          categoryKey="variety"
          getBarSize={() => 100}
          barKeys={barKeys}
          valueUnit="t/ha"
          cardClass="min-h-80"
          isLoading={isLoading}
        />
      ) : (
        <GroupedBarChart
          data={topRows}
          header={chartHeader}
          categoryKey="variety"
          getBarSize={() => 100}
          barKeys={barKeys}
          valueUnit="t/ha"
          cardClass="min-h-120"
          isLoading={isLoading}
        />
      )}

      {(hiddenCount > 0 || trimmedCount > 0) && !noSearchResults && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 -mt-2">
          {hiddenCount > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {hiddenCount} {hiddenCount === 1 ? 'variety' : 'varieties'} not shown.{' '}
              <button
                onClick={() => setLimit(VARIETY_LIMIT_OPTIONS.find(n => n > limit) ?? VARIETY_LIMIT_OPTIONS[VARIETY_LIMIT_OPTIONS.length - 1])}
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Show more
              </button>
            </p>
          )}
          {trimmedCount > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {trimmedCount} {trimmedCount === 1 ? 'variety' : 'varieties'} hidden by search filter.{' '}
              <button
                onClick={() => setSearchQuery('')}
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Clear filter
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
});
