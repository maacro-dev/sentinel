import { memo, useMemo, useState } from 'react';
import { Button } from '@/core/components/ui/button';
import { ChevronUp, ChevronDown, Lightbulb } from 'lucide-react';
import { ChartConfig } from '@/core/components/ui/chart';
import { BarChart } from './BarChart';
import { BarangayYieldRankingResponse } from '../schemas/barangayYield';

interface BarangayYieldBarChartProps {
  data: BarangayYieldRankingResponse;
  title: string;
  description: string;
}

export const BarangayYieldBarChart = memo(({ data, title, description }: BarangayYieldBarChartProps) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const { ranking, overallAverage } = data;

  const sortedAndLimitedData = useMemo(() => {
    const sorted = [...ranking].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.avg_yield_t_per_ha - a.avg_yield_t_per_ha;
      } else {
        return a.avg_yield_t_per_ha - b.avg_yield_t_per_ha;
      }
    });
    return sorted.slice(0, 5).map(item => ({
      location: `${item.barangay}, ${item.municipality}`,
      yield: item.avg_yield_t_per_ha,
    }));
  }, [ranking, sortOrder]);

  const chartConfig = useMemo<ChartConfig>(() => ({
    yield: { label: 'Yield (t/ha)' },
  }), []);

  const toggleSort = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const insights = useMemo(() => {
    if (ranking.length === 0) return null;

    const yields = ranking.map(d => d.avg_yield_t_per_ha);
    const highest = Math.max(...yields);
    const highestItem = ranking.find(d => d.avg_yield_t_per_ha === highest)!;
    const lowest = Math.min(...yields);
    const lowestItem = ranking.find(d => d.avg_yield_t_per_ha === lowest)!;
    const gap = highest - lowest;
    const gapPercent = ((gap / highest) * 100).toFixed(1);

    return {
      highestBarangay: highestItem.barangay,
      highestMunicipality: highestItem.municipality,
      highestValue: highest,
      lowestBarangay: lowestItem.barangay,
      lowestMunicipality: lowestItem.municipality,
      lowestValue: lowest,
      overallAverage,
      gapPercent,
    };
  }, [ranking, overallAverage]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <BarChart
        config={chartConfig}
        data={sortedAndLimitedData}
        header={{ title: title, description: description }}
        axisKeys={{ X: 'yield', Y: 'location' }}
        layout="vertical"
        isEmpty={ranking.length === 0}
        activeBar={{}}
        options={{
          enabled: true,
          component: (
            <Button variant="outline" size="sm" onClick={toggleSort} className="gap-2 text-2xs text-primary/75">
              {sortOrder === 'desc' ? <ChevronDown size={3} /> : <ChevronUp size={3} />}
              {sortOrder === 'desc' ? 'Top 5' : 'Bottom 5'}
            </Button>
          ),
        }}
        axisOptions={{
          X: {
            interval: 0,
            tickFormatter: (value: number) => `${value} t/ha`,
          },
          Y: {
            tickFormatter: (value: string) => {
              return value.length > 30 ? value.slice(0, 18) + '…' : value;
            },
          },
        }}
        cardClass="min-h-110"
      />

      {insights && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>
            {ranking.length === 1 ? (
              <>
                Only <span className="font-medium text-foreground">{ranking[0].barangay}, {ranking[0].municipality}</span> has yield data,
                with <span className="font-medium text-foreground">{ranking[0].avg_yield_t_per_ha.toFixed(2)} t/ha</span>.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{insights.highestBarangay}, {insights.highestMunicipality}</span> leads with{' '}
                <span className="font-medium text-foreground">{insights.highestValue.toFixed(2)} t/ha</span>,{' '}
                outperforming{' '}
                <span className="font-medium text-foreground">{insights.lowestBarangay}, {insights.lowestMunicipality}</span> by{' '}
                <span className="font-medium text-foreground">{insights.gapPercent}%</span>.
                The overall average across all{' '}
                <span className="font-medium text-foreground">{ranking.length}</span> barangay{ranking.length > 1 ? 's' : ''} is{' '}
                <span className="font-medium text-foreground">{insights.overallAverage.toFixed(2)} t/ha</span>.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
});
