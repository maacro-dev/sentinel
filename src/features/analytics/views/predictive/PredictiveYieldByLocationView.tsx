import { Lightbulb } from 'lucide-react';
import { ChartConfig } from '@/core/components/ui/chart';
import { StatCardMinimal } from '../../components/StatCard';
import { PredictedYieldLocationData } from '../../schemas/predictive/yield-location';
import { BarChart } from '../../components/BarChart';

const config = {
  yield: { label: 'Predicted Yield (t/ha)' },
} satisfies ChartConfig;

export function PredictedYieldByLocationView({ data }: { data: PredictedYieldLocationData }) {
  const chartData = data.ranking.map(item => ({
    location: item.location,
    yield: Number(item.yield.toFixed(2)),
  }));

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <StatCardMinimal
          title="Avg Predicted Yield"
          subtitle="Weighted average"
          current_value={Number(data.average_yield.toFixed(2))}
          unit="t/ha"
        />
        <StatCardMinimal
          title="Highest"
          subtitle={data.highest_yield?.location ?? 'N/A'}
          current_value={data.highest_yield?.value ?? 0}
          unit="t/ha"
        />
        <StatCardMinimal
          title="Lowest"
          subtitle={data.lowest_yield?.location ?? 'N/A'}
          current_value={data.lowest_yield?.value ?? 0}
          unit="t/ha"
        />
        <StatCardMinimal
          title="Gap"
          subtitle="High vs Low"
          current_value={data.gap_percentage}
          unit="%"
        />
      </div>

      <BarChart
        config={config}
        data={chartData}
        header={{ title: 'Predicted Yield by Location', description: 'Average predicted yield per location' }}
        axisKeys={{ X: 'yield', Y: 'location' }}
        layout="vertical"
        isEmpty={chartData.length === 0}
        axisOptions={{
          X: { tickFormatter: (v) => `${v} t/ha` },
          Y: { tickFormatter: (v) => v.length > 25 ? v.slice(0, 22) + '…' : v },
        }}
        cardClass="min-h-120"
      />

      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
        <Lightbulb className="size-4 mt-0.5 shrink-0" />
        <p>
          {data.highest_yield ? (
            <>
              <span className="font-medium">{data.highest_yield.location}</span> is predicted to have the highest yield (
              <span className="font-medium">{data.highest_yield.value.toFixed(2)} t/ha</span>),{' '}
              {data.lowest_yield ? (
                <>outperforming <span className="font-medium">{data.lowest_yield.location}</span> by <span className="font-medium">{data.gap_percentage.toFixed(1)}%</span>.</>
              ) : (
                'with no low‑yield locations.'
              )}
            </>
          ) : (
            'No predicted yield data available.'
          )}
        </p>
      </div>
    </div>

  );
}
