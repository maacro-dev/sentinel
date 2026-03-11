import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { ChartConfig } from '@/core/components/ui/chart';
import { Global } from '@/core/config';
import { YieldByLocationData } from '@/features/analytics/schemas/comparative/yield-location';
import { DefaultTicks } from '../components/DefaultTicks';
import { StatCardMinimal } from '../components/StatCard';
import { TickProps } from '../types';
import { BarChart } from '../components/BarChart';
import { Lightbulb } from 'lucide-react';

export const yieldByLocationChartConfig = {
  Aklan: {
    label: "Aklan"
  },
  Antique: {
    label: "Antique"
  },
  Capiz: {
    label: "Capiz"
  },
  Iloilo: {
    label: "Iloilo"
  },
  Guimaras: {
    label: "Guimaras"
  },
  yield: {
    label: "Yield (t/ha)"
  }
} satisfies ChartConfig;

const header = {
  title: "Yield by Location",
  description: "Comparison across provinces, municipalities, and barangays",
};

export function YieldByLocationView({ data, level }: { data?: YieldByLocationData; level?: 'province' | 'municipality' | 'barangay' }) {
  if (!data || data.ranking.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Yield by Location</CardTitle></CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          {Global.NO_DATA_MESSAGE}
        </CardContent>
      </Card>
    );
  }

  const roundedRanking = data.ranking.map(item => ({
    ...item,
    yield: Number(item.yield.toFixed(2))
  }));

  const chartData = level === 'province'
    ? roundedRanking
    : roundedRanking.filter(item => item.yield > 0);

  // Compute derived values for the tip
  const highest = data.highest_yield;
  const lowest = data.lowest_yield;
  const gap = data.gap_percentage;
  const avg = data.average_yield;
  const locationsWithData = roundedRanking.filter(item => item.yield > 0).length;

  return (
    <div className='flex flex-col gap-4'>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <StatCardMinimal
          title='Average Yield'
          subtitle='TBD'
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
      </div>

      <BarChart
        config={yieldByLocationChartConfig}
        data={chartData}
        header={header}
        axisKeys={{ X: "location", Y: "yield" }}
        isEmpty={chartData.length === 0}
        activeBar={{}}
        axisOptions={{
          X: {
            interval: 0,
            tick: ({ x, y, payload }: TickProps) => <DefaultTicks x={x} y={y} payload={payload} />,
          },
          Y: {
            tickFormatter: (value: number) => `${value} t/ha`,
          },
        }}
        cardClass="min-h-120"
      />

      {data.ranking.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>
            {highest ? (
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
            )}
          </p>
        </div>
      )}
    </div>
  );
}
