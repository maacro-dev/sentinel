import { StatCardSparkline } from '../components/StatCard';
import { MultiLineChart } from '../components/MultiLineChart';
import { ComparisonPieChart } from '../components/ComparisonPieChart';
import { YieldByMethodData } from '../schemas/comparative/yield-method';
import { buildLineRows, generateShades, HUMAY_BASE, normaliseCompareProps } from '../utils';
import { useMemo } from 'react';
import { useTrendData } from '../hooks/useTrendData';


interface YieldByMethodViewProps {
  data: YieldByMethodData;
  compareData?: any[];
  currentSeasonLabel?: string | null;
  compareSeasonLabels?: string[];
  compareSeasonLabel?: string | null;
  comparisonStats?: any[];
  isLoading?: boolean;
}

export function YieldByMethodView({
  data,
  compareData,
  currentSeasonLabel,
  compareSeasonLabels,
  compareSeasonLabel,
  comparisonStats,
  isLoading = false,
}: YieldByMethodViewProps) {
  const { cmpLabels, cmpDataItems, hasComparison, primaryStats, compareStatsList } =
    normaliseCompareProps({ compareData, comparisonStats, compareSeasonLabels, compareSeasonLabel });

  const currentLabel = currentSeasonLabel ?? 'Current Season';
  const isAllSeasons = currentLabel === 'All Seasons';

  const { highest_method: highest, lowest_method: lowest, average_yield: avg } = data;

  const { dominantAdoptionEntry, mostUsed, leastUsed } = useMemo(() => {
    const ranking = data.ranking;
    if (!ranking.length) return { dominantAdoptionEntry: null, mostUsed: null, leastUsed: null };
    return {
      dominantAdoptionEntry: ranking.reduce((a, b) => a.adoption_rate >= b.adoption_rate ? a : b),
      mostUsed: ranking.reduce((a, b) => a.count >= b.count ? a : b),
      leastUsed: ranking.reduce((a, b) => a.count <= b.count ? a : b),
    };
  }, [data.ranking]);

  const dominantAdoption = dominantAdoptionEntry?.adoption_rate ?? 0;
  const dominantMethod = dominantAdoptionEntry?.method ?? null;

  const normalizedCmpDataItems = useMemo(() => {
    if (!hasComparison) return [];
    return cmpDataItems.map(items =>
      Array.isArray(items)
        ? items.map((item: any) => ({ ...item, location: FORMAT_METHOD(item.method ?? '') }))
        : items,
    );
  }, [hasComparison, cmpDataItems]);

  const formattedRanking = useMemo(
    () => data.ranking.map(r => ({ ...r, location: FORMAT_METHOD(r.method) })),
    [data.ranking],
  );

  const { rows: lineRows, locationKeys } = useMemo(
    () => buildLineRows(formattedRanking, currentLabel, normalizedCmpDataItems, hasComparison ? cmpLabels : [], !isAllSeasons, true),
    [formattedRanking, currentLabel, normalizedCmpDataItems, hasComparison, cmpLabels, isAllSeasons],
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
    list.forEach((s, i) => { map[s] = shades[i % shades.length]; });
    return map;
  }, [isAllSeasons, currentLabel, cmpLabels]);

  const pieDataByMetric = useMemo(() => Object.fromEntries(
    STAT_METRICS.map(({ key, unit }) => {
      let entries: { name: string; value: number; fill: string }[];

      if (key === 'adoptionRate') {
        entries = buildAdoptionPieData(data.ranking, cmpDataItems, isAllSeasons);
      } else {
        entries = [];
        if (!isAllSeasons) {
          const entry = buildPieEntry(currentLabel, primaryStats, key, seasonColorMap[currentLabel]);
          if (entry) entries.push(entry);
        }
        compareStatsList.forEach((stats: any, i: number) => {
          const entry = buildPieEntry(cmpLabels[i], stats, key, seasonColorMap[cmpLabels[i]]);
          if (entry) entries.push(entry);
        });
      }

      return [key, { data: entries, insight: buildInsight(entries, key, unit) }];
    }),
  ), [isAllSeasons, currentLabel, primaryStats, compareStatsList, cmpLabels, seasonColorMap, data.ranking, cmpDataItems],);

  const trends = useTrendData(
    compareStatsList, cmpLabels, primaryStats, currentLabel, isAllSeasons,
    ['avg', 'highest', 'lowest'],
  );

  const chartKey = `method-${data.ranking.length}`;

  const sameMethod = highest?.method === lowest?.method;

  const allSeasonsCards = isAllSeasons && (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      <StatCardSparkline
        title="Overall Average Yield" subtitle="Across all methods and seasons"
        value={Number(avg.toFixed(2))} unit="t/ha" trend={trends.avg}
      />
      {sameMethod ? (
        <>
          <StatCardSparkline
            title="Overall Best Yield" subtitle="Highest recorded method yield"
            value={highest ? highest.value : 0} unit="t/ha"
            tooltip={highest ? FORMAT_METHOD(highest.method) : null}
            trend={trends.highest}
          />
          <StatCardSparkline
            title="Overall Lowest Yield" subtitle="Lowest recorded method yield"
            value={lowest ? lowest.value : 0} unit="t/ha"
            tooltip={lowest ? FORMAT_METHOD(lowest.method) : null}
            trend={trends.lowest}
          />
        </>
      ) : (
        <>
          <StatCardSparkline
            title="Overall Best Method" subtitle="Highest average yield among methods"
            display={highest ? FORMAT_METHOD(highest.method) : 'N/A'}
            value={highest ? highest.value : 0}
            tooltip={highest ? `${Number(highest.value).toFixed(2)} t/ha` : null}
            trend={trends.highest}
          />
          <StatCardSparkline
            title="Overall Weakest Method" subtitle="Lowest average yield among methods"
            display={lowest ? FORMAT_METHOD(lowest.method) : 'N/A'}
            value={lowest ? lowest.value : 0}
            tooltip={lowest ? `${Number(lowest.value).toFixed(2)} t/ha` : null}
            trend={trends.lowest}
          />
        </>
      )}
      <StatCardSparkline
        title="Overall Adoption"
        subtitle={dominantMethod ? FORMAT_METHOD(dominantMethod) : 'N/A'}
        value={dominantAdoption} unit="%"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {allSeasonsCards}

      {!isAllSeasons && !hasComparison && (
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatCardSparkline
            title="Average Yield" subtitle="Across all methods"
            value={Number(avg.toFixed(2))} unit="t/ha" trend={trends.avg}
          />
          <StatCardSparkline
            title="Best Method" subtitle={highest ? FORMAT_METHOD(highest.method) : 'N/A'}
            value={highest ? Number(highest.value.toFixed(2)) : 0} unit="t/ha" trend={trends.highest}
          />
          <StatCardSparkline
            title="Most Used Method"
            subtitle={mostUsed ? FORMAT_METHOD(mostUsed.method) : 'N/A'}
            value={mostUsed ? mostUsed.count : 0} unit="records"
          />
          <StatCardSparkline
            title="Least Used Method"
            subtitle={leastUsed ? FORMAT_METHOD(leastUsed.method) : 'N/A'}
            value={leastUsed ? leastUsed.count : 0} unit="records"
          />
        </div>
      )}

      {hasComparison && (
        <div className="grid auto-rows-min gap-4 grid-cols-4">
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
        <MultiLineChart
          key={chartKey}
          data={lineRows}
          categoryKey="season"
          containerClass="h-120"
          lineKeys={locationKeys}
          colors={locationShades}
          valueUnit="t/ha"
          isLoading={isLoading}
          header={{
            title: 'Yield by Method',
            description: `${currentLabel} vs ${cmpLabels.join(', ')}`,
          }}
        />
      )}
    </div>
  );
}


const FORMAT_METHOD = (m: string) => m === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted';

const STAT_METRICS = [
  { key: 'avg', title: 'Average Yield', subtitle: 'Mean across all methods per season', unit: 't/ha' },
  { key: 'highest', title: 'Best Method Yield', subtitle: 'Highest yielding method per season', unit: 't/ha' },
  { key: 'lowest', title: 'Weakest Method Yield', subtitle: 'Lowest yielding method per season', unit: 't/ha' },
  { key: 'adoptionRate', title: 'Method Adoption', subtitle: 'Direct-seeded vs transplanted share per season', unit: '%' },
] as const;

const ADOPTION_PIE_SHADES = generateShades(HUMAY_BASE, 2);
const ADOPTION_METHOD_COLORS: Record<string, string> = {
  'direct-seeded': ADOPTION_PIE_SHADES[0],
  'transplanted': ADOPTION_PIE_SHADES[1],
};
const ADOPTION_METHODS = ['direct-seeded', 'transplanted'] as const;

function buildAdoptionPieData(
  ranking: YieldByMethodData['ranking'],
  cmpDataItems: any[],
  isAllSeasons: boolean,
): { name: string; value: number; fill: string }[] {
  const rates: Record<string, number[]> = { 'direct-seeded': [], 'transplanted': [] };

  if (!isAllSeasons) {
    ranking.forEach((r) => {
      if (rates[r.method]) rates[r.method].push(r.adoption_rate);
    });
  }

  cmpDataItems.forEach((items) => {
    if (!Array.isArray(items)) return;
    items.forEach((item: any) => {
      if (item.method && rates[item.method]) {
        rates[item.method].push(item.adoption_rate_compare ?? 0);
      }
    });
  });

  const result: { name: string; value: number; fill: string }[] = [];
  for (const method of ADOPTION_METHODS) {
    const methodRates = rates[method];
    if (!methodRates.length) continue;
    const avgRate = methodRates.reduce((a, b) => a + b, 0) / methodRates.length;
    if (avgRate > 0) {
      result.push({
        name: FORMAT_METHOD(method),
        value: Number(avgRate.toFixed(1)),
        fill: ADOPTION_METHOD_COLORS[method],
      });
    }
  }
  return result;
}

function buildPieEntry(
  label: string,
  stats: any,
  metric: string,
  fill: string,
): { name: string; value: number; fill: string } | null {
  const val = stats?.[metric];
  if (val == null) return null;
  const method =
    metric === 'highest' ? stats?.highestMethod :
      metric === 'lowest' ? stats?.lowestMethod : null;
  return {
    name: method ? `${label} (${FORMAT_METHOD(method)})` : label,
    value: val,
    fill,
  };
}

function buildInsight(
  data: { name: string; value: number }[],
  metric: string,
  unit: string,
): string {
  if (data.length === 0) return '';

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = sorted[0];
  const min = sorted[sorted.length - 1];
  const single = data.length === 1 ? data[0] : null;
  const fmt = (v: number, isPercent = false) => isPercent ? v.toFixed(1) : v.toFixed(2);

  switch (metric) {
    case 'avg':
      return single
        ? `${single.name} recorded an average yield of ${fmt(single.value)} ${unit}.`
        : `${max.name} has the highest seasonal average at ${fmt(max.value)} ${unit}, while ${min.name} is lowest at ${fmt(min.value)} ${unit}.`;

    case 'highest': {
      if (single) return `${single.name} yielded best at ${fmt(single.value)} ${unit}.`;
      const methods = sorted.map(item => item.name.split('(').pop()?.replace(')', '').trim() ?? '');
      const allSame = methods.every(m => m === methods[0]);
      return allSame
        ? `${methods[0]} yields ranged from ${fmt(min.value)} to ${fmt(max.value)} ${unit} across seasons.`
        : `${max.name} gave the best method yield at ${fmt(max.value)} ${unit}. ${min.name} showed the lowest best-method value at ${fmt(min.value)} ${unit}.`;
    }

    case 'lowest': {
      if (single) return `Weakest method yield was ${fmt(single.value)} ${unit} in ${single.name}.`;
      const methods = sorted.map(item => item.name.split('(').pop()?.replace(')', '').trim() ?? '');
      const allSame = methods.every(m => m === methods[0]);
      return allSame
        ? `${methods[0]} weakest yields ranged from ${fmt(min.value)} to ${fmt(max.value)} ${unit} across seasons.`
        : `Weakest method yield occurred in ${min.name} at ${fmt(min.value)} ${unit}. The strongest weakest case was in ${max.name} at ${fmt(max.value)} ${unit}.`;
    }

    case 'adoptionRate': {
      if (single) return `${single.name} accounted for ${fmt(single.value, true)}% of the adoption.`;
      const domMethod = max.name.split(' — ').pop() ?? max.name;
      const leastMethod = min.name.split(' — ').pop() ?? min.name;
      if (max.value === min.value && domMethod === leastMethod) {
        return `${domMethod} consistently had ${fmt(max.value, true)}% adoption across all selected seasons.`;
      }
      if (domMethod === leastMethod) {
        return `${domMethod} adoption ranged from ${fmt(min.value, true)}% to ${fmt(max.value, true)}% across seasons.`;
      }
      return `${domMethod} dominated adoption at ${fmt(max.value, true)}% (${max.name}), while ${leastMethod} was adopted least at ${fmt(min.value, true)}% (${min.name}).`;
    }

    default:
      return '';
  }
}
