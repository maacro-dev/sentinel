// @ts-nocheck

import { Lightbulb } from 'lucide-react';
import { useMemo } from 'react';
import { StatCardMinimal } from '../../components/StatCard';
import { TrendChart } from '../../components/TrendChart';
import { YieldForecastData } from '../../schemas/predictive/forecast';

export function YieldForecastView({ data }: { data: YieldForecastData }) {
  const chartData = useMemo(() => {
    return data.forecast.map(item => ({
      month: item.month,
      yield: Number(item.yield.toFixed(2)),
    }));
  }, [data]);

  const header = {
    title: 'Yield Forecast',
    description: 'Predicted total yield by month',
  };

  // Compute expected change % between the highest and lowest month
  const highest = data.max_monthly;
  const lowest = data.min_monthly;
  const expectedChange = highest > 0 ? ((highest - lowest) / highest) * 100 : 0;
  const riskLevel = expectedChange > 30 ? 'High' : expectedChange > 15 ? 'Medium' : 'Low';

  return (
    <div className="flex flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <StatCardMinimal
          title="Total Predicted Yield"
          subtitle="Season total"
          current_value={Number(data.total_predicted.toFixed(2))}
          unit="t/ha"
        />
        <StatCardMinimal
          title="Expected Change"
          subtitle="Peak vs trough"
          current_value={Number(expectedChange.toFixed(1))}
          unit="%"
        />
        <StatCardMinimal
          title="Risk Level"
          subtitle={riskLevel}
          current_value={0}
          unit=""
        />
      </div>

      <TrendChart
        data={chartData}
        header={header}
        axisKeys={{ X: 'month', Y: 'yield' }}
        isEmpty={chartData.length === 0}
        config={{ yield: { label: 'Predicted Yield (t/ha)' } }}
        axisOptions={{
          X: {
            interval: 0,
          },
          Y: {
            tickFormatter: (value: number) => `${value} t/ha`,
          },
        }}
        cardClass="min-h-120"
      />

      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
        <Lightbulb className="size-4 mt-0.5 shrink-0" />
        <p>
          {data.forecast.length > 0 ? (
            <>
              The forecast shows a peak of <span className="font-medium">{highest.toFixed(2)} t/ha</span> in {data.forecast.reduce((max, item) => item.yield > max.yield ? item : max, data.forecast[0]).month},{' '}
              with a variation of <span className="font-medium">{expectedChange.toFixed(1)}%</span> across the season.
              The risk level is <span className="font-medium">{riskLevel}</span>.
            </>
          ) : (
            'No forecast data available.'
          )}
        </p>
      </div>
    </div>
  );
}
