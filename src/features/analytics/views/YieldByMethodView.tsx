import { ChartConfig } from '@/core/components/ui/chart';
import { DefaultTicks } from '../components/DefaultTicks';
import { StatCardMinimal } from '../components/StatCard';
import { TickProps } from '../types';
import { BarChart } from '../components/BarChart';
import { Lightbulb } from 'lucide-react';
import { YieldByMethodData } from '../schemas/comparative/yield-method';

export const yieldByMethodChartConfig = {
  'direct-seeded': { label: 'Direct Seeded' },
  transplanted: { label: 'Transplanted' },
  yield: { label: 'Yield (t/ha)' },
} satisfies ChartConfig;

const header = {
  title: 'Yield by Method',
  description: 'Comparison of crop establishment methods',
};

export function YieldByMethodView({ data }: { data: YieldByMethodData }) {

  const chartData = data.ranking.map(item => ({
    method: item.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted',
    yield: Number(item.yield.toFixed(2)),
  }));

  const highest = data.highest_method;
  const gap = data.gap_percentage;

  const directSeeded = data.ranking.find(m => m.method === 'direct-seeded');
  const transplanted = data.ranking.find(m => m.method === 'transplanted');
  const dsCount = directSeeded?.count ?? 0;
  const tpCount = transplanted?.count ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <StatCardMinimal
          title="Highest Yield"
          subtitle={highest ? (highest.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted') : 'N/A'}
          current_value={highest ? Number(highest.value.toFixed(2)) : 0}
          unit="t/ha"
        />
        <StatCardMinimal
          title="Direct Seeded"
          subtitle={`${dsCount} record${dsCount !== 1 ? 's' : ''}`}
          current_value={dsCount}
          unit=""
        />
        <StatCardMinimal
          title="Transplanted"
          subtitle={`${tpCount} record${tpCount !== 1 ? 's' : ''}`}
          current_value={tpCount}
          unit=""
        />
        <StatCardMinimal
          title="Yield Gap"
          subtitle="High vs Low difference"
          current_value={Number(gap.toFixed(1))}
          unit="%"
        />
      </div>

      <BarChart
        config={yieldByMethodChartConfig}
        data={chartData}
        header={header}
        axisKeys={{ X: 'method', Y: 'yield' }}
        isEmpty={chartData.every(d => d.yield === 0)}
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
            {(() => {
              const methodsWithData = data.ranking.filter(item => item.yield > 0);

              if (methodsWithData.length === 0) {
                return <>No yield data available for any method.</>;
              }

              if (methodsWithData.length === 1) {
                const method = methodsWithData[0];
                return (
                  <>
                    Only <span className="font-medium text-foreground">
                      {method.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted'}
                    </span>{' '}
                    is used, with an average yield of{' '}
                    <span className="font-medium text-foreground">{method.yield.toFixed(2)} t/ha</span>.
                  </>
                );
              }

              const highest = data.highest_method!;
              const lowest = data.lowest_method!;
              const gap = data.gap_percentage;

              if (highest.value === lowest.value) {
                return (
                  <>
                    Both methods have equal average yields of{' '}
                    <span className="font-medium text-foreground">{highest.value.toFixed(2)} t/ha</span>.
                  </>
                );
              }

              return (
                <>
                  <span className="font-medium text-foreground">
                    {highest.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted'}
                  </span>{' '}
                  leads with{' '}
                  <span className="font-medium text-foreground">{highest.value.toFixed(2)} t/ha</span>{' '}
                  average yield, outperforming{' '}
                  <span className="font-medium text-foreground">
                    {lowest.method === 'direct-seeded' ? 'Direct Seeded' : 'Transplanted'}
                  </span>{' '}
                  by{' '}
                  <span className="font-medium text-foreground">{gap.toFixed(1)}%</span>.
                </>
              );
            })()}
            {' '}The overall average yield is{' '}
            <span className="font-medium text-foreground">{data.average_yield.toFixed(2)} t/ha</span>.
          </p>
        </div>
      )}
    </div>
  );
}
